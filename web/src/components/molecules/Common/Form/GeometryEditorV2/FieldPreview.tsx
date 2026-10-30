import styled from "@emotion/styled";
import type { FeatureCollection } from "geojson";
import { useEffect, useRef } from "react";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PopConfirm from "@reearth-cms/components/atoms/PopConfirm";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Typography from "@reearth-cms/components/atoms/Typography";
import { useT } from "@reearth-cms/i18n";
import { BrowserUtils } from "@reearth-cms/utils/browserUtils";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { kindIcon, summarize } from "./core/labels";
import type { GeometryIssue } from "./core/validation";
import { formatIssue } from "./core/validation";
import { alpha } from "./map/mapStyle";
import { extentOf, fitTo } from "./map/useMapFocus";
import { useMapSync } from "./map/useMapSync";
import { DEFAULT_VIEW, useOlMap } from "./map/useOlMap";

type Props = {
  collection: FeatureCollection;
  issues: GeometryIssue[];
  disabled: boolean;
  onOpen: () => void;
  onCopy: () => void;
  onClear: () => void;
};

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
  const summary = invalid ? t("Invalid value") : summarize(collection);

  return (
    <Wrapper invalid={invalid}>
      <Bar>
        <Summary>
          {firstKind && (
            <Icon icon={kindIcon(firstKind)} size={14} color={AntdColor.NEUTRAL.TEXT_TERTIARY} />
          )}
          <Typography.Text type={empty ? "secondary" : undefined} ellipsis={{ tooltip: summary }}>
            {summary}
          </Typography.Text>
        </Summary>
        <BarActions>
          {!empty && (
            <Tooltip title={t("Fly to shapes")}>
              <Button
                type="text"
                size="small"
                aria-label={t("Fly to shapes")}
                icon={<Icon icon="send" size={14} />}
                onClick={() => fit(400)}
              />
            </Tooltip>
          )}
          {!empty && (
            <Tooltip title={t("Copy GeoJSON")}>
              <Button
                type="text"
                size="small"
                aria-label={t("Copy GeoJSON")}
                icon={<Icon icon="copy" size={14} />}
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
                  icon={<Icon icon="delete" size={14} />}
                />
              </Tooltip>
            </PopConfirm>
          )}
          {disabled ? (
            <Button size="small" icon={<Icon icon="fullscreen" size={14} />} onClick={onOpen}>
              {t("View")}
            </Button>
          ) : (
            !empty && (
              <Button size="small" icon={<Icon icon="edit" size={14} />} onClick={onOpen}>
                {t("Edit geometry")}
              </Button>
            )
          )}
        </BarActions>
      </Bar>
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
        {!empty && (
          <ZoomHint className="zoom-hint">
            {BrowserUtils.IS_MAC ? t("⌘ + scroll to zoom") : t("Ctrl + scroll to zoom")}
          </ZoomHint>
        )}
      </MapArea>
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
  height: 360px;
  .ol-attribution {
    bottom: 0;
    right: 0;
    font-size: 10px;
  }
  &:hover .zoom-hint {
    opacity: 1;
  }
`;

const MapContainer = styled.div`
  position: absolute;
  inset: 0;
`;

const EmptyOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${AntdToken.SPACING.XS}px;
  background: ${alpha(AntdColor.NEUTRAL.BG_WHITE, 0.6)};
  pointer-events: none;
  z-index: 1;
  .ant-btn {
    pointer-events: auto;
  }
`;

const ZoomHint = styled.div`
  position: absolute;
  left: ${AntdToken.SPACING.XS}px;
  bottom: ${AntdToken.SPACING.XS}px;
  padding: 2px ${AntdToken.SPACING.XS}px;
  border-radius: ${AntdToken.RADIUS.SM}px;
  background: ${alpha(AntdColor.NEUTRAL.BG_WHITE, 0.85)};
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  font-size: 11px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
`;

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${AntdToken.SPACING.XS}px ${AntdToken.SPACING.SM}px;
  min-height: 40px;
  padding: ${AntdToken.SPACING.XXS}px ${AntdToken.SPACING.SM}px;
  border-bottom: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
`;

const Summary = styled.div`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XS}px;
  /* Basis 0 keeps summary and actions on one row until the field gets narrow. */
  flex: 1 1 0;
  min-width: 140px;
`;

const BarActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XXS}px;
  flex-wrap: wrap;
  justify-content: flex-end;
  .ant-btn-icon {
    display: inline-flex;
    align-items: center;
  }
`;
