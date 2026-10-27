import styled from "@emotion/styled";
import type Draw from "ol/interaction/Draw";
import { useCallback, useMemo, useRef, useState } from "react";

import Modal from "@reearth-cms/components/atoms/Modal";
import Splitter from "@reearth-cms/components/atoms/Splitter";
import Typography from "@reearth-cms/components/atoms/Typography";
import { useT } from "@reearth-cms/i18n";
import { AntdToken } from "@reearth-cms/utils/style";

import { readFieldValue } from "./core/fieldValue";
import type { FieldValue } from "./core/fieldValue";
import { createGeoStore } from "./core/geoStore";
import type { GeoStore } from "./core/geoStore";
import { GeoStoreProvider, useGeoSnapshot } from "./core/StoreContext";
import { EditOrigin, GeometryKind } from "./core/types";
import type { GeometryIssue } from "./core/validation";
import EditorHeader from "./editor/EditorHeader";
import SideSplit from "./editor/SideSplit";
import { useDraft } from "./editor/useDraft";
import { useEditorShortcuts } from "./editor/useEditorShortcuts";
import { useReplaceGuard } from "./editor/useReplaceGuard";
import { useSearchPin } from "./editor/useSearchPin";
import { useUndoNotice } from "./editor/useUndoNotice";
import EditorMap from "./map/EditorMap";
import { MapTool, TOOL_KIND } from "./map/mapTools";
import CoordinatesPanel from "./panels/CoordinatesPanel";
import GeoJsonPanel from "./panels/GeoJsonPanel";
import type { GeoJsonPanelHandle } from "./panels/GeoJsonPanel";
import ShapeList from "./panels/ShapeList";

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
  const snapshot = useGeoSnapshot();
  const [tool, setTool] = useState<MapTool>(MapTool.SELECT);
  const [jsonOpen, setJsonOpen] = useState(() => !initial.ok);
  const [coordinatesOpen, setCoordinatesOpen] = useState<boolean>(false);
  const [issues, setIssues] = useState<GeometryIssue[]>([]);
  const drawRef = useRef<Draw | null>(null);
  const jsonPanelRef = useRef<GeoJsonPanelHandle>(null);

  const originals = useMemo(
    () => (initial.ok ? initial.originals : new Map<string, string>()),
    [initial],
  );
  const hasValue = snapshot.collection.features.length > 0;
  const validateOptions = useMemo(() => ({ allowedKinds }), [allowedKinds]);

  const showUndoNotice = useUndoNotice(store);
  const { confirmReplace, notifyReplaced } = useReplaceGuard(store, multiple, hasValue);
  const search = useSearchPin({ store, multiple, confirmReplace, notifyReplaced });
  const { requestClose, apply } = useDraft({
    store,
    initialCollection: initial.ok ? initial.collection : null,
    originals,
    multiple,
    readOnly,
    jsonPanelRef,
    onApply,
    onClose,
  });

  const deleteShape = useCallback(
    (id: string) => {
      store.removeFeature(id, EditOrigin.LIST);
      showUndoNotice({ message: t("Shape deleted"), duration: 4 });
    },
    [showUndoNotice, store, t],
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

  useEditorShortcuts({ store, tool, setTool, drawRef, readOnly, requestClose, deleteShape });

  const toggleCoordinates = useCallback(() => setCoordinatesOpen(open => !open), []);
  const toggleJson = useCallback(() => setJsonOpen(open => !open), []);

  const pointAllowed = allowedKinds.includes(GeometryKind.POINT);
  const searchAddLabel = !pointAllowed
    ? undefined
    : !multiple && hasValue
      ? t("Replace point")
      : t("Add point");

  const drawableKinds = allowedKinds.filter(kind => Object.values(TOOL_KIND).includes(kind));
  const drawHint =
    drawableKinds.length > 0
      ? t("Pick a tool on the map, search for a place, or paste GeoJSON below.")
      : t("Paste GeoJSON below.");

  const count = snapshot.collection.features.length;

  return (
    // Keys typed here must not reach a modal underneath (e.g. the schema field dialog's Esc).
    <Layout onKeyDown={e => e.stopPropagation()}>
      <EditorHeader
        title={title}
        multiple={multiple}
        readOnly={readOnly}
        canUndo={snapshot.undoDepth > 0}
        canRedo={snapshot.redoDepth > 0}
        applyBlocked={issues.length > 0}
        onUndo={() => store.undo()}
        onRedo={() => store.redo()}
        onCancel={requestClose}
        onApply={apply}
        onClose={onClose}
      />
      <StyledSplitter>
        <Splitter.Panel defaultSize={360} min={280} max="50%">
          <SideSplit
            bottomOpen={jsonOpen}
            top={
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
                <CoordinatesPanel
                  open={coordinatesOpen}
                  readOnly={readOnly}
                  onToggle={toggleCoordinates}
                />
              </SidePane>
            }
            bottom={
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
            }
          />
        </Splitter.Panel>
        <Splitter.Panel>
          <EditorMap
            initialSearch={initialQuery}
            multiple={multiple}
            readOnly={readOnly}
            allowedKinds={allowedKinds}
            tool={tool}
            drawRef={drawRef}
            searchPin={search.searchPin}
            searchAddLabel={searchAddLabel}
            replaceWarning={!multiple && hasValue}
            onReplaced={notifyReplaced}
            onToolRequest={requestTool}
            onDeleteSelected={() => {
              const selected = store.getSnapshot().selectedId;
              if (selected) deleteShape(selected);
            }}
            onSearchFlyTo={search.flyTo}
            onSearchAdd={search.add}
            onSearchClear={search.clear}
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

const StyledSplitter = styled(Splitter)`
  flex: 1;
  min-height: 0;
`;

const SidePane = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
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
