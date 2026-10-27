import styled from "@emotion/styled";
import type { Point } from "geojson";
import type Draw from "ol/interaction/Draw";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal, { useModal } from "@reearth-cms/components/atoms/Modal";
import Notification from "@reearth-cms/components/atoms/Notification";
import Splitter from "@reearth-cms/components/atoms/Splitter";
import Tag from "@reearth-cms/components/atoms/Tag";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Typography from "@reearth-cms/components/atoms/Typography";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { readFieldValue, writeFieldValue } from "./core/fieldValue";
import type { FieldValue } from "./core/fieldValue";
import { createGeoStore } from "./core/geoStore";
import type { GeoStore } from "./core/geoStore";
import { GeoUtils } from "./core/GeoUtils";
import { GeoStoreProvider, useGeoSnapshot } from "./core/StoreContext";
import { EditOrigin, GeometryKind } from "./core/types";
import type { GeometryIssue } from "./core/validation";
import EditorMap from "./map/EditorMap";
import type { SearchPin } from "./map/EditorMap";
import { MapTool, TOOL_KIND } from "./map/mapTools";
import GeoJsonPanel from "./panels/GeoJsonPanel";
import type { GeoJsonPanelHandle } from "./panels/GeoJsonPanel";
import ShapeList from "./panels/ShapeList";
import type { GeocodeResult } from "./search/providers";

/** Shared with the legacy field so "Do not show this again" means the same thing. */
const REPLACE_WARNING_KEY = "disableGeometryWarning";
/** Height of the collapsed GeoJSON panel: just its header. */
const GEOJSON_HEADER_HEIGHT = 41;

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl";

type Props = {
  open: boolean;
  /** A place search to run as soon as the editor opens (from the inline field). */
  initialQuery?: string;
  title: string;
  multiple: boolean;
  readOnly: boolean;
  allowedKinds: readonly GeometryKind[];
  value: FieldValue;
  onApply: (value: string | string[]) => void;
  onClose: () => void;
};

const storedFlag = (key: string) => {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
};

const setStoredFlag = (key: string, on: boolean) => {
  try {
    if (on) localStorage.setItem(key, "true");
    else localStorage.removeItem(key);
  } catch {
    // Preferences are a convenience; ignore storage failures.
  }
};

/**
 * Full-screen editor for one field. It edits a draft: Apply writes the draft into the
 * item form, Cancel throws it away, and the item's own Save persists to the server.
 */
const EditorModal: React.FC<Props> = props => {
  const { open, value, multiple, allowedKinds } = props;
  const initial = useMemo(
    () => (open ? readFieldValue(value, multiple, { allowedKinds }) : null),
    // Read once per opening; later value changes come from Apply itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );
  const store = useMemo(
    () =>
      initial
        ? createGeoStore(
            initial.ok ? initial.collection : { type: "FeatureCollection", features: [] },
          )
        : null,
    [initial],
  );

  return (
    <StyledModal
      open={open}
      footer={null}
      closable={false}
      keyboard={false}
      maskClosable={false}
      destroyOnHidden
      width="calc(100vw - 32px)"
      style={{ top: 16, paddingBottom: 0 }}
      styles={{ body: { padding: 0, height: "calc(100vh - 32px)" } }}
      onCancel={props.onClose}>
      {store && initial && (
        <GeoStoreProvider value={store}>
          <EditorBody {...props} store={store} initial={initial} />
        </GeoStoreProvider>
      )}
    </StyledModal>
  );
};

type BodyProps = Props & {
  store: GeoStore;
  initial: NonNullable<ReturnType<typeof readFieldValue>>;
};

const EditorBody: React.FC<BodyProps> = ({
  title,
  multiple,
  readOnly,
  allowedKinds,
  store,
  initial,
  initialQuery,
  onApply,
  onClose,
}) => {
  const t = useT();
  const { confirm } = useModal();
  const snapshot = useGeoSnapshot();
  const [tool, setTool] = useState<MapTool>(MapTool.SELECT);
  const [searchPin, setSearchPin] = useState<SearchPin | null>(null);
  const [jsonOpen, setJsonOpen] = useState(() => !initial.ok);
  const [jsonSize, setJsonSize] = useState<number | string>("45%");
  const [issues, setIssues] = useState<GeometryIssue[]>([]);
  const drawRef = useRef<Draw | null>(null);
  const jsonPanelRef = useRef<GeoJsonPanelHandle>(null);

  const originals = useMemo(
    () => (initial.ok ? initial.originals : new Map<string, string>()),
    [initial],
  );
  const initialCollection = initial.ok ? initial.collection : null;
  const hasValue = snapshot.collection.features.length > 0;
  const validateOptions = useMemo(() => ({ allowedKinds }), [allowedKinds]);

  const toggleJson = useCallback(() => {
    setJsonOpen(open => !open);
  }, []);

  /** Single-value fields replace their value; warn once, as the legacy field does. */
  const confirmReplace = useCallback(
    (proceed: () => void) => {
      if (multiple || !hasValue || storedFlag(REPLACE_WARNING_KEY)) {
        proceed();
        return;
      }
      confirm({
        title: t("You are entering a new value"),
        content: (
          <div>
            <p>
              {t("This action will replace the previously entered value. Do you want to continue?")}
            </p>
            <Checkbox onChange={e => setStoredFlag(REPLACE_WARNING_KEY, e.target.checked)}>
              {t("Do not show this again")}
            </Checkbox>
          </div>
        ),
        okText: t("Continue"),
        onOk: proceed,
      });
    },
    [confirm, hasValue, multiple, t],
  );

  const requestTool = useCallback(
    (next: MapTool) => {
      if (next === MapTool.SELECT || next === tool) {
        setTool(MapTool.SELECT);
        return;
      }
      store.select(null);
      confirmReplace(() => setTool(next));
    },
    [confirmReplace, store, tool],
  );

  const deleteShape = useCallback(
    (id: string) => {
      store.removeFeature(id, EditOrigin.LIST);
      const key = `geometry-delete-${Date.now()}`;
      Notification.info({
        key,
        message: t("Shape deleted"),
        placement: "bottomLeft",
        duration: 4,
        btn: (
          <Button
            size="small"
            onClick={() => {
              store.undo();
              Notification.destroy(key);
            }}>
            {t("Undo")}
          </Button>
        ),
      });
    },
    [store, t],
  );

  /**
   * Single fields: a new shape replaces the old one. The confirm dialog can be switched off
   * ("Do not show this again"), so this notice always tells the user, with a way back.
   */
  const notifyReplaced = useCallback(() => {
    const key = `geometry-replace-${Date.now()}`;
    Notification.info({
      key,
      message: t("Replaced the previous shape"),
      description: t("This field holds one shape."),
      placement: "bottomLeft",
      duration: 5,
      btn: (
        <Button
          size="small"
          onClick={() => {
            store.undo();
            Notification.destroy(key);
          }}>
          {t("Undo")}
        </Button>
      ),
    });
  }, [store, t]);

  const pointAllowed = allowedKinds.includes(GeometryKind.POINT);
  const searchAddLabel = !pointAllowed
    ? undefined
    : !multiple && hasValue
      ? t("Replace point")
      : t("Add point");

  const handleSearchFlyTo = useCallback(
    (result: GeocodeResult) => {
      setSearchPin({ id: result.id, label: result.label, position: result.position });
      if (result.bbox) store.focus({ kind: "extent", extent: result.bbox });
      else store.focus({ kind: "position", position: result.position, zoom: 16 });
    },
    [store],
  );

  const handleSearchAdd = useCallback(
    (result: GeocodeResult) => {
      const geometry: Point = { type: "Point", coordinates: result.position };
      confirmReplace(() => {
        if (multiple) {
          store.addFeature(geometry, EditOrigin.SEARCH);
        } else {
          const replacing = store.getSnapshot().collection.features.length > 0;
          store.replaceAll(geometry, EditOrigin.SEARCH);
          if (replacing) notifyReplaced();
        }
        store.focus({ kind: "position", position: result.position, zoom: 16 });
        setSearchPin(null);
      });
    },
    [confirmReplace, multiple, notifyReplaced, store],
  );

  const handleSearchClear = useCallback(() => setSearchPin(null), []);

  /** Flushes typed text first, so edits from the last moments count. */
  const hasChanges = useCallback((): boolean => {
    if (jsonPanelRef.current?.flush() === false) return true;
    return (
      !initialCollection ||
      !GeoUtils.isEqual(GeoUtils.normalize(initialCollection), store.getSnapshot().collection)
    );
  }, [initialCollection, store]);

  const requestClose = useCallback(() => {
    if (readOnly || !hasChanges()) {
      onClose();
      return;
    }
    confirm({
      title: t("Discard changes to this geometry?"),
      content: t("Your edits have not been applied to the item yet."),
      okText: t("Discard"),
      okButtonProps: { danger: true },
      onOk: onClose,
    });
  }, [confirm, hasChanges, onClose, readOnly, t]);

  const apply = useCallback(() => {
    // Text typed just before Apply may not have reached the store yet.
    if (jsonPanelRef.current?.flush() === false) return;
    if (hasChanges()) {
      onApply(writeFieldValue(store.getSnapshot().collection, multiple, originals));
    }
    onClose();
  }, [hasChanges, multiple, onApply, onClose, originals, store]);

  // Shortcuts only while this editor is open, and never while typing in a field.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.querySelector(".ant-modal-confirm")) return;
      const target = e.target as HTMLElement | null;
      const typing = !!target?.closest("input, textarea, [contenteditable='true'], .monaco-editor");
      const mod = e.metaKey || e.ctrlKey;

      if (e.key === "Escape") {
        if (typing) return;
        e.preventDefault();
        if (tool !== MapTool.SELECT) {
          drawRef.current?.abortDrawing();
          setTool(MapTool.SELECT);
        } else if (store.getSnapshot().selectedId) {
          store.select(null);
        } else {
          requestClose();
        }
        return;
      }
      if (typing || readOnly) return;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        store.redo();
      } else if (e.key === "Backspace" && tool !== MapTool.SELECT) {
        e.preventDefault();
        drawRef.current?.removeLastPoint();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const selected = store.getSnapshot().selectedId;
        if (selected) {
          e.preventDefault();
          deleteShape(selected);
        }
      }
    };
    // Capture phase: runs even though the editor stops keys from bubbling to modals below.
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [deleteShape, readOnly, requestClose, store, tool]);

  const drawableKinds = allowedKinds.filter(kind => Object.values(TOOL_KIND).includes(kind));
  const drawHint =
    drawableKinds.length > 0
      ? t("Pick a tool on the map, search for a place, or paste GeoJSON below.")
      : t("Paste GeoJSON below.");

  const count = snapshot.collection.features.length;

  return (
    // Keys typed here must not reach a modal underneath (e.g. the schema field dialog's Esc).
    <Layout onKeyDown={e => e.stopPropagation()}>
      <Header>
        <Title>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          <Tooltip
            title={
              multiple
                ? t(
                    "This field holds several shapes. Each new drawing or search result is added as another shape.",
                  )
                : t(
                    "This field holds one shape. Drawing a shape or adding a search result replaces the current one.",
                  )
            }>
            <ModeTag bordered={false}>
              {multiple ? t("Multiple shapes") : t("Single shape")}
            </ModeTag>
          </Tooltip>
          {readOnly && <Tag color="default">{t("Read only")}</Tag>}
        </Title>
        <HeaderActions>
          {!readOnly && (
            <>
              <Tooltip title={`${t("Undo")} (${MOD}+Z)`}>
                <Button
                  type="text"
                  aria-label={t("Undo")}
                  icon={<Icon icon="undo" />}
                  disabled={snapshot.undoDepth === 0}
                  onClick={() => store.undo()}
                />
              </Tooltip>
              <Tooltip title={`${t("Redo")} (${MOD}+Shift+Z)`}>
                <Button
                  type="text"
                  aria-label={t("Redo")}
                  icon={<Icon icon="redo" />}
                  disabled={snapshot.redoDepth === 0}
                  onClick={() => store.redo()}
                />
              </Tooltip>
              <Divider />
              <Button onClick={requestClose}>{t("Cancel")}</Button>
              <Tooltip title={issues.length > 0 ? t("Fix the GeoJSON problems first") : undefined}>
                <Button type="primary" disabled={issues.length > 0} onClick={apply}>
                  {t("Apply")}
                </Button>
              </Tooltip>
            </>
          )}
          {readOnly && <Button onClick={onClose}>{t("Close")}</Button>}
        </HeaderActions>
      </Header>
      <StyledSplitter>
        <Splitter.Panel defaultSize={360} min={280} max="50%">
          <SideSplitter
            layout="vertical"
            onResize={sizes => {
              if (jsonOpen) setJsonSize(sizes[1]);
            }}>
            <Splitter.Panel min={120}>
              <SidePane>
                <SideHeader>
                  <Typography.Text strong>{multiple ? t("Shapes") : t("Shape")}</Typography.Text>
                  {multiple && <Typography.Text type="secondary">{count}</Typography.Text>}
                </SideHeader>
                <ListScroll>
                  <ShapeList
                    multiple={multiple}
                    readOnly={readOnly}
                    drawHint={drawHint}
                    onDelete={deleteShape}
                  />
                </ListScroll>
              </SidePane>
            </Splitter.Panel>
            <Splitter.Panel
              size={jsonOpen ? jsonSize : GEOJSON_HEADER_HEIGHT}
              min={jsonOpen ? 160 : GEOJSON_HEADER_HEIGHT}
              max={jsonOpen ? "85%" : GEOJSON_HEADER_HEIGHT}
              resizable={jsonOpen}>
              <GeoJsonPanel
                ref={jsonPanelRef}
                multiple={multiple}
                readOnly={readOnly}
                open={jsonOpen}
                validateOptions={validateOptions}
                initialInvalid={
                  initial.ok ? undefined : { text: initial.text, issues: initial.issues }
                }
                onToggle={toggleJson}
                onIssuesChange={setIssues}
              />
            </Splitter.Panel>
          </SideSplitter>
        </Splitter.Panel>
        <Splitter.Panel>
          <EditorMap
            initialSearch={initialQuery}
            multiple={multiple}
            readOnly={readOnly}
            allowedKinds={allowedKinds}
            tool={tool}
            drawRef={drawRef}
            searchPin={searchPin}
            searchAddLabel={searchAddLabel}
            replaceWarning={!multiple && hasValue}
            onReplaced={notifyReplaced}
            onToolRequest={requestTool}
            onDeleteSelected={() => {
              const selected = store.getSnapshot().selectedId;
              if (selected) deleteShape(selected);
            }}
            onSearchFlyTo={handleSearchFlyTo}
            onSearchAdd={handleSearchAdd}
            onSearchClear={handleSearchClear}
          />
        </Splitter.Panel>
      </StyledSplitter>
    </Layout>
  );
};

export default EditorModal;

const StyledModal = styled(Modal)`
  max-width: none;
  .ant-modal-content {
    padding: 0;
    overflow: hidden;
  }
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${AntdToken.SPACING.BASE}px;
  height: 56px;
  flex-shrink: 0;
  padding: 0 ${AntdToken.SPACING.BASE}px 0 ${AntdToken.SPACING.LG}px;
  border-bottom: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XS}px;
  min-width: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XS}px;
`;

const Divider = styled.span`
  width: 1px;
  height: 20px;
  margin: 0 ${AntdToken.SPACING.XXS}px;
  background: ${AntdColor.NEUTRAL.BORDER};
`;

const StyledSplitter = styled(Splitter)`
  flex: 1;
  min-height: 0;
`;

const SideSplitter = styled(Splitter)`
  height: 100%;
`;

const SidePane = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const ModeTag = styled(Tag)`
  cursor: help;
`;

const SideHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${AntdToken.SPACING.XS}px;
  padding: ${AntdToken.SPACING.SM}px ${AntdToken.SPACING.SM}px ${AntdToken.SPACING.XS}px;
  flex-shrink: 0;
`;

const ListScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;
