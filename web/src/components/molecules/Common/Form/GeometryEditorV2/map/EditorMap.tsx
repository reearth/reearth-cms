import styled from "@emotion/styled";
import type { Position } from "geojson";
import Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import Point from "ol/geom/Point";
import type Draw from "ol/interaction/Draw";
import { fromLonLat } from "ol/proj";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Segmented from "@reearth-cms/components/atoms/Segmented";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { GeoUtils } from "../core/GeoUtils";
import { useGeoSnapshot, useGeoStore } from "../core/StoreContext";
import type { GeometryKind } from "../core/types";
import type { GeocodeResult } from "../search/providers";
import SearchBox from "../search/SearchBox";

import { BaseMapId, baseMapOptions } from "./baseMaps";
import { MapTool, TOOL_KIND } from "./mapTools";
import { useMapFocus, extentOf, fitTo } from "./useMapFocus";
import { useMapInteractions } from "./useMapInteractions";
import { useMapSync } from "./useMapSync";
import { useOlMap } from "./useOlMap";

const BASEMAP_KEY = "reearth-cms:geometry-v2:basemap";

export type SearchPin = {
  readonly id: string;
  readonly label: string;
  readonly position: Position;
};

type Props = {
  /** Single field that already has a shape: drawing replaces it. */
  replaceWarning?: boolean;
  onReplaced?: () => void;
  initialSearch?: string;
  multiple: boolean;
  readOnly: boolean;
  allowedKinds: readonly GeometryKind[];
  tool: MapTool;
  drawRef: RefObject<Draw | null>;
  searchPin: SearchPin | null;
  searchAddLabel?: string;
  onToolRequest: (tool: MapTool) => void;
  onDeleteSelected: () => void;
  onSearchFlyTo: (result: GeocodeResult) => void;
  onSearchAdd: (result: GeocodeResult) => void;
  onSearchClear: () => void;
};

const TOOL_ICON = {
  [MapTool.SELECT]: "select",
  [MapTool.POINT]: "mapPin",
  [MapTool.LINE]: "lineString",
  [MapTool.POLYGON]: "polygon",
} as const;

const EditorMap: React.FC<Props> = ({
  replaceWarning,
  onReplaced,
  initialSearch,
  multiple,
  readOnly,
  allowedKinds,
  tool,
  drawRef,
  searchPin,
  searchAddLabel,
  onToolRequest,
  onDeleteSelected,
  onSearchFlyTo,
  onSearchAdd,
  onSearchClear,
}) => {
  const t = useT();
  const store = useGeoStore();
  const { collection, selectedId, focus } = useGeoSnapshot();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIdRef = useRef<string | null>(selectedId);
  const handles = useOlMap(containerRef, { preview: false, selectedIdRef });
  const [baseMap, setBaseMap] = useState<BaseMapId>(() => {
    try {
      return (localStorage.getItem(BASEMAP_KEY) as BaseMapId) || BaseMapId.OSM;
    } catch {
      return BaseMapId.OSM;
    }
  });

  useMapSync(handles?.source ?? null, collection);
  useMapFocus(handles, focus);

  const handleDrawEnd = useCallback(() => onToolRequest(MapTool.SELECT), [onToolRequest]);
  useMapInteractions({
    handles,
    store,
    tool,
    multiple,
    readOnly,
    drawRef,
    onDrawEnd: handleDrawEnd,
    onReplaced,
  });

  // Frame the value once when the editor opens; never again behind the user's back.
  const fittedRef = useRef(false);
  useEffect(() => {
    if (!handles || fittedRef.current) return;
    fittedRef.current = true;
    const geometries = collection.features.flatMap(f => (f.geometry ? [f.geometry] : []));
    fitTo(handles, extentOf(geometries), 16, 0);
  }, [handles, collection]);

  // Selection drives styling and which shape Translate may move.
  useEffect(() => {
    selectedIdRef.current = selectedId;
    if (!handles) return;
    handles.selected.clear();
    const feature = selectedId ? handles.source.getFeatureById(selectedId) : null;
    const data = GeoUtils.findFeature(collection, selectedId);
    if (feature && GeoUtils.isEditableKind(data?.geometry)) {
      handles.selected.push(feature as Feature<Geometry>);
    }
    handles.layer.changed();
  }, [handles, selectedId, collection]);

  // Every editable shape can be reshaped (runs after useMapSync, so new shapes exist).
  useEffect(() => {
    if (!handles) return;
    handles.editable.clear();
    for (const data of collection.features) {
      if (!GeoUtils.isEditableKind(data.geometry)) continue;
      const feature = handles.source.getFeatureById(String(data.id));
      if (feature) handles.editable.push(feature as Feature<Geometry>);
    }
  }, [handles, collection]);

  useEffect(() => {
    if (!handles) return;
    handles.bases.forEach((layer, id) => layer.setVisible(id === baseMap));
  }, [handles, baseMap]);

  useEffect(() => {
    if (!handles) return;
    handles.pinSource.clear();
    if (searchPin) {
      handles.pinSource.addFeature(new Feature(new Point(fromLonLat(searchPin.position))));
    }
  }, [handles, searchPin]);

  const zoomBy = (delta: number) => {
    const view = handles?.map.getView();
    view?.animate({ zoom: (view.getZoom() ?? 0) + delta, duration: 200 });
  };

  const toolOptions = [MapTool.SELECT, MapTool.POINT, MapTool.LINE, MapTool.POLYGON]
    .filter(option => option === MapTool.SELECT || allowedKinds.includes(TOOL_KIND[option]))
    .map(option => ({
      value: option,
      label: (
        <Tooltip title={TOOL_TIPS[option](t)} placement="bottom">
          <ToolLabel>
            <Icon icon={TOOL_ICON[option]} size={14} />
            {TOOL_LABELS[option](t)}
          </ToolLabel>
        </Tooltip>
      ),
    }));

  const toolHint =
    tool === MapTool.POINT
      ? t("Click the map to place the point · Esc to cancel")
      : tool === MapTool.LINE || tool === MapTool.POLYGON
        ? t(
            "Click to add vertices · Double-click to finish · Backspace removes the last one · Esc to cancel",
          )
        : null;
  const drawHint =
    toolHint && replaceWarning ? `${t("Replaces the current shape")} · ${toolHint}` : toolHint;

  // Controls live in a bar above the map, so nothing on the map can be mistaken for data.
  return (
    <Wrapper>
      <TopBar>
        <BarLeft>
          <SearchBox
            initialQuery={initialSearch}
            activeResultId={searchPin?.id ?? null}
            addLabel={readOnly ? undefined : searchAddLabel}
            onFlyTo={onSearchFlyTo}
            onAdd={onSearchAdd}
            onClear={onSearchClear}
          />
        </BarLeft>
        <BarCenter>
          {!readOnly && (
            <>
              <Segmented
                value={tool}
                options={toolOptions}
                onChange={value => onToolRequest(value as MapTool)}
              />
              <Tooltip title={t("Delete selected shape (Delete)")} placement="bottom">
                <Button
                  danger
                  type="text"
                  disabled={!selectedId}
                  icon={<Icon icon="delete" />}
                  aria-label={t("Delete selected shape")}
                  onClick={onDeleteSelected}
                />
              </Tooltip>
            </>
          )}
        </BarCenter>
        <BarRight>
          <Select
            value={baseMap}
            options={baseMapOptions()}
            aria-label={t("Base map")}
            popupMatchSelectWidth={false}
            onChange={value => {
              setBaseMap(value);
              try {
                localStorage.setItem(BASEMAP_KEY, value);
              } catch {
                // Not remembering the base map is acceptable.
              }
            }}
            style={{ width: 180 }}
          />
          <Space.Compact>
            <Tooltip title={t("Zoom out")} placement="bottom">
              <Button
                aria-label={t("Zoom out")}
                icon={<Icon icon="minus" />}
                onClick={() => zoomBy(-1)}
              />
            </Tooltip>
            <Tooltip title={t("Zoom in")} placement="bottom">
              <Button
                aria-label={t("Zoom in")}
                icon={<Icon icon="plus" />}
                onClick={() => zoomBy(1)}
              />
            </Tooltip>
          </Space.Compact>
        </BarRight>
      </TopBar>
      <MapArea>
        <MapContainer ref={containerRef} />
        {drawHint && <Hint role="status">{drawHint}</Hint>}
      </MapArea>
    </Wrapper>
  );
};

type T = ReturnType<typeof useT>;
const TOOL_LABELS: Record<MapTool, (t: T) => string> = {
  [MapTool.SELECT]: t => t("Select"),
  [MapTool.POINT]: t => t("Point"),
  [MapTool.LINE]: t => t("Line"),
  [MapTool.POLYGON]: t => t("Polygon"),
};
const TOOL_TIPS: Record<MapTool, (t: T) => string> = {
  [MapTool.SELECT]: t => t("Select, move and reshape shapes"),
  [MapTool.POINT]: t => t("Draw a point"),
  [MapTool.LINE]: t => t("Draw a line"),
  [MapTool.POLYGON]: t => t("Draw an area"),
};

export default EditorMap;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const TopBar = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: ${AntdToken.SPACING.SM}px;
  min-height: 52px;
  padding: ${AntdToken.SPACING.XS}px ${AntdToken.SPACING.SM}px;
  border-bottom: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  background: ${AntdColor.NEUTRAL.BG_WHITE};
  position: relative;
  z-index: 3;
  .ant-segmented {
    background: ${AntdColor.NEUTRAL.FILL_TERTIARY};
  }
`;

const BarLeft = styled.div`
  min-width: 0;
`;

const BarCenter = styled.div`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XXS}px;
`;

const BarRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${AntdToken.SPACING.XS}px;
  min-width: 0;
`;

const ToolLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 2px;
`;

const MapArea = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  .ol-attribution {
    bottom: 0;
    right: 0;
    border-radius: ${AntdToken.RADIUS.SM}px 0 0 0;
  }
`;

const MapContainer = styled.div`
  position: absolute;
  inset: 0;
`;

const Hint = styled.div`
  position: absolute;
  bottom: ${AntdToken.SPACING.LG}px;
  left: 50%;
  transform: translateX(-50%);
  padding: ${AntdToken.SPACING.XS}px ${AntdToken.SPACING.SM}px;
  border-radius: ${AntdToken.RADIUS.LG}px;
  background: rgba(0, 0, 0, 0.75);
  color: ${AntdColor.NEUTRAL.BG_WHITE};
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1;
`;
