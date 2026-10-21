import styled from "@emotion/styled";
import type { FeatureCollection } from "geojson";
import { useEffect, useRef } from "react";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PopConfirm from "@reearth-cms/components/atoms/PopConfirm";
import Search from "@reearth-cms/components/atoms/Search";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Typography from "@reearth-cms/components/atoms/Typography";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { kindIcon, summarize } from "./core/labels";
import type { GeometryIssue } from "./core/validation";
import { formatIssue } from "./core/validation";
import { extentOf, fitTo } from "./map/useMapFocus";
import { useMapSync } from "./map/useMapSync";
import { DEFAULT_VIEW, useOlMap } from "./map/useOlMap";

type Props = {
  collection: FeatureCollection;
  issues: GeometryIssue[];
  disabled: boolean;
  onOpen: () => void;
  /** Opens the editor with this place search already run. */
  onSearch: (query: string) => void;
  onCopy: () => void;
  onClear: () => void;
};

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * The field as it sits in the item form: a map you can look at, a one-line summary, and
 * a way into the full editor. Editing happens only in the editor, so there is one place
 * to learn.
 */
const FieldPreview: React.FC<Props> = ({
  collection,
  issues,
  disabled,
  onOpen,
  onSearch,
  onCopy,
  onClear,
}) => {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIdRef = useRef<string | null>(null);
  const handles = useOlMap(containerRef, { preview: true, selectedIdRef });
  const empty = collection.features.length === 0;
  const invalid = issues.length > 0;

  useMapSync(handles?.source ?? null, collection);

  const fit = (duration = 0) => {
    if (!handles) return;
    const geometries = collection.features.flatMap(f => (f.geometry ? [f.geometry] : []));
    if (geometries.length === 0) {
      handles.map.getView().animate({ ...DEFAULT_VIEW, duration });
      return;
    }
    fitTo(handles, extentOf(geometries), 16, duration);
  };

  // The preview always frames the whole value; it is not a place to wander around.
  useEffect(() => {
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handles, collection]);

  useEffect(() => {
    if (!handles) return;
    const handler = () => onOpen();
    handles.map.on("dblclick", handler);
    return () => handles.map.un("dblclick", handler);
  }, [handles, onOpen]);

  const firstKind = collection.features[0]?.geometry?.type;

  return (
    <Wrapper invalid={invalid}>
      <MapArea>
        <MapContainer ref={containerRef} />
        {empty && !invalid && (
          <EmptyOverlay>
            <Typography.Text type="secondary">{t("No geometry yet")}</Typography.Text>
            {!disabled && (
              <Button type="primary" icon={<Icon icon="plus" />} onClick={onOpen}>
                {t("Add geometry")}
              </Button>
            )}
          </EmptyOverlay>
        )}
        {!disabled && (
          // Where today's field has it: people look for search on the map in the form.
          <SearchOverlay>
            <Search
              size="small"
              allowClear
              aria-label={t("Search for a place or address")}
              placeholder={t("Search for a place or address")}
              onSearch={value => {
                if (value.trim()) onSearch(value.trim());
              }}
            />
          </SearchOverlay>
        )}
        <Overlay>
          {!empty && (
            <Tooltip title={t("Fit to shapes")} placement="left">
              <Button
                size="small"
                aria-label={t("Fit to shapes")}
                icon={<Icon icon="fitBounds" />}
                onClick={() => fit(250)}
              />
            </Tooltip>
          )}
          <Tooltip title={disabled ? t("Open full screen") : t("Open editor")} placement="left">
            <Button
              size="small"
              aria-label={disabled ? t("Open full screen") : t("Open editor")}
              icon={<Icon icon="fullscreen" />}
              onClick={onOpen}
            />
          </Tooltip>
        </Overlay>
        {!empty && (
          <ZoomHint>{isMac ? t("⌘ + scroll to zoom") : t("Ctrl + scroll to zoom")}</ZoomHint>
        )}
      </MapArea>
      {invalid && (
        <Alert
          banner
          type="error"
          message={t("This value is not valid GeoJSON")}
          description={formatIssue(issues[0])}
          action={
            !disabled && (
              <Button size="small" onClick={onOpen}>
                {t("Fix in editor")}
              </Button>
            )
          }
        />
      )}
      <Footer>
        <Summary>
          {firstKind && (
            <Icon icon={kindIcon(firstKind)} size={14} color={AntdColor.NEUTRAL.TEXT_TERTIARY} />
          )}
          <Typography.Text type={empty ? "secondary" : undefined} ellipsis>
            {invalid ? t("Invalid value") : summarize(collection)}
          </Typography.Text>
        </Summary>
        <FooterActions>
          {!empty && (
            <Tooltip title={t("Copy GeoJSON")}>
              <Button
                type="text"
                size="small"
                aria-label={t("Copy GeoJSON")}
                icon={<Icon icon="editorCopy" size={14} />}
                onClick={onCopy}
              />
            </Tooltip>
          )}
          {!disabled && !empty && (
            <PopConfirm
              title={t("Clear this geometry?")}
              okText={t("Clear")}
              okButtonProps={{ danger: true }}
              cancelText={t("Cancel")}
              onConfirm={onClear}>
              <Tooltip title={t("Clear")}>
                <Button
                  type="text"
                  size="small"
                  aria-label={t("Clear")}
                  icon={<Icon icon="delete" />}
                />
              </Tooltip>
            </PopConfirm>
          )}
          {!disabled && !empty && (
            <Button size="small" icon={<Icon icon="edit" />} onClick={onOpen}>
              {t("Edit geometry")}
            </Button>
          )}
          {disabled && (
            <Button size="small" icon={<Icon icon="fullscreen" />} onClick={onOpen}>
              {t("View")}
            </Button>
          )}
        </FooterActions>
      </Footer>
    </Wrapper>
  );
};

export default FieldPreview;

const Wrapper = styled.div<{ invalid: boolean }>`
  border: 1px solid ${({ invalid }) => (invalid ? AntdColor.RED.RED_4 : AntdColor.NEUTRAL.BORDER)};
  border-radius: ${AntdToken.RADIUS.LG}px;
  overflow: hidden;
  background: ${AntdColor.NEUTRAL.BG_WHITE};
`;

const MapArea = styled.div`
  position: relative;
  height: 280px;
  .ol-attribution {
    bottom: 0;
    right: 0;
    font-size: 10px;
  }
`;

const MapContainer = styled.div`
  position: absolute;
  inset: 0;
`;

const SearchOverlay = styled.div`
  position: absolute;
  top: ${AntdToken.SPACING.XS}px;
  left: ${AntdToken.SPACING.XS}px;
  width: 260px;
  max-width: calc(100% - 96px);
  z-index: 2;
  box-shadow: ${AntdToken.SHADOW.SECONDARY};
  border-radius: ${AntdToken.RADIUS.BASE}px;
`;

const Overlay = styled.div`
  position: absolute;
  top: ${AntdToken.SPACING.XS}px;
  right: ${AntdToken.SPACING.XS}px;
  display: flex;
  gap: ${AntdToken.SPACING.XXS}px;
  z-index: 1;
  .ant-btn {
    box-shadow: ${AntdToken.SHADOW.SECONDARY};
  }
`;

const EmptyOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${AntdToken.SPACING.XS}px;
  background: rgba(255, 255, 255, 0.72);
  z-index: 1;
`;

const ZoomHint = styled.div`
  position: absolute;
  left: ${AntdToken.SPACING.XS}px;
  bottom: ${AntdToken.SPACING.XS}px;
  padding: 2px ${AntdToken.SPACING.XS}px;
  border-radius: ${AntdToken.RADIUS.SM}px;
  background: rgba(255, 255, 255, 0.85);
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  font-size: 11px;
  pointer-events: none;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${AntdToken.SPACING.XS}px;
  padding: ${AntdToken.SPACING.XS}px ${AntdToken.SPACING.SM}px;
  border-top: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
`;

const Summary = styled.div`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XS}px;
  min-width: 0;
`;

const FooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XXS}px;
  flex-shrink: 0;
`;
