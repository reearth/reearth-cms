import type { Geometry as GeoJsonGeometry } from "geojson";
import { never, primaryAction } from "ol/events/condition";
import type Feature from "ol/Feature";
import type { FeatureLike } from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import Point from "ol/geom/Point";
import Draw from "ol/interaction/Draw";
import type Interaction from "ol/interaction/Interaction";
import Modify from "ol/interaction/Modify";
import Snap from "ol/interaction/Snap";
import Translate from "ol/interaction/Translate";
import type MapBrowserEvent from "ol/MapBrowserEvent";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { useEffect } from "react";
import type { RefObject } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { useT } from "@reearth-cms/i18n";
import { GeoUtils, GeometryKind } from "@reearth-cms/utils/geoUtils";

import type { GeoStore, GeometryUpdate } from "../core/geoStore";
import { EditOrigin } from "../core/types";

import { handleAt, isNearHandle, vertexIndexAt } from "./handles";
import { ShapeStyle } from "./mapStyle";
import type { MapTool } from "./mapTools";
import { drawType } from "./mapTools";
import { GEOJSON_FORMAT } from "./useMapSync";
import type { MapHandles } from "./useOlMap";

/** The handle under the pointer while it can be grabbed or is being dragged. */
const GRAB_STYLE = new Style({
  image: new CircleStyle({
    radius: 7,
    fill: new Fill({ color: ShapeStyle.HANDLE }),
    stroke: new Stroke({ color: ShapeStyle.WHITE, width: 2 }),
  }),
  zIndex: 200,
});

const toGeoJson = (geometry: Geometry) =>
  GEOJSON_FORMAT.writeGeometryObject(geometry) as GeoJsonGeometry;

type Options = {
  handles: MapHandles | null;
  store: GeoStore;
  tool: MapTool;
  multiple: boolean;
  readOnly: boolean;
  /** Lets the keyboard handler abort a sketch or drop its last vertex. */
  drawRef: RefObject<Draw | null>;
  /** Single field: a drawing replaced an existing shape. */
  onReplaced?: () => void;
};

/**
 * Map -> store. Every gesture commits once, on its end event, so a drag is one undo step
 * and the text panel is not rewritten on every mouse move.
 */
export function useMapInteractions({
  handles,
  store,
  tool,
  multiple,
  readOnly,
  drawRef,
  onReplaced,
}: Options) {
  const t = useT();

  useEffect(() => {
    if (!handles || readOnly) return;
    const { map, source, selected } = handles;
    const selectedGeometry = () => selected.item(0)?.getGeometry();
    const added: Interaction[] = [];
    const register = (interaction: Interaction) => {
      map.addInteraction(interaction);
      added.push(interaction);
    };

    const commit = (features: readonly Feature<Geometry>[]) => {
      const updates: GeometryUpdate[] = [];
      for (const feature of features) {
        const geometry = feature.getGeometry();
        const id = feature.getId();
        if (id !== undefined && geometry) {
          updates.push({ featureId: String(id), geometry: toGeoJson(geometry) });
        }
      }
      store.setGeometries(updates, EditOrigin.MAP);
    };

    const type = drawType(tool);
    if (type === null) {
      // Select first, then: drag a white dot to move a vertex, drag a small dot to add one,
      // drag anywhere else on the shape to move it, Alt/Opt + click a white dot to remove it.
      // The same for points, lines and polygons. Multi* and GeometryCollection are never
      // selectable for editing.
      // ol dispatches to the most recently added interaction first: Modify goes after
      // Translate and only takes the drag when it starts on a handle.
      const translate = new Translate({ features: selected, hitTolerance: 6 });
      translate.on("translatestart", () => store.beginGesture());
      translate.on("translateend", event => {
        store.endGesture();
        commit(event.features.getArray());
      });
      register(translate);

      const modify = new Modify({
        features: selected,
        // Alt-click removal is done in the click handler below, through the store.
        deleteCondition: never,
        condition: event => {
          const geometry = selectedGeometry();
          return (
            primaryAction(event) && !!geometry && handleAt(map, geometry, event.pixel) !== null
          );
        },
        // Modify previews the grab point anywhere along an edge; show it only on handles.
        style: (feature: FeatureLike, resolution: number) => {
          const geometry = selectedGeometry();
          const point = feature.getGeometry();
          if (!geometry || !(point instanceof Point)) return undefined;
          return isNearHandle(geometry, point.getCoordinates(), resolution)
            ? GRAB_STYLE
            : undefined;
        },
      });
      modify.on("modifystart", event => {
        store.beginGesture();
        // Dragging a vertex selects it, so its numbers show while it moves.
        const geometry = selectedGeometry();
        if (geometry && geometry.getType() !== GeometryKind.POINT) {
          const index = vertexIndexAt(map, geometry, event.mapBrowserEvent.pixel);
          if (index !== null) store.selectVertex(index);
        }
      });
      modify.on("modifyend", event => {
        store.endGesture();
        commit(event.features.getArray());
      });
      register(modify);
    } else {
      // No `source`: the store adds the shape and it comes back through useMapSync with an id.
      const draw = new Draw({ type });
      draw.on("drawstart", () => store.beginGesture());
      draw.on("drawabort", () => store.endGesture());
      draw.on("drawend", event => {
        store.endGesture();
        const geometry = event.feature.getGeometry();
        if (!geometry) return;
        if (multiple) store.addFeature(toGeoJson(geometry), EditOrigin.MAP);
        else {
          const replacing = store.getSnapshot().collection.features.length > 0;
          store.replaceAll(toGeoJson(geometry), EditOrigin.MAP);
          if (replacing) onReplaced?.();
        }
        // The tool stays active for the next shape; as when picking a tool, nothing is
        // selected, so no edit handles show while drawing.
        store.select(null);
      });
      register(draw);
      drawRef.current = draw;
    }
    register(new Snap({ source }));

    return () => {
      added.forEach(interaction => map.removeInteraction(interaction));
      drawRef.current = null;
      store.endGesture();
    };
  }, [handles, store, tool, multiple, readOnly, drawRef, onReplaced]);

  useEffect(() => {
    if (!handles || drawType(tool) !== null) return;
    const { map, layer } = handles;
    // Captured now: by cleanup time the map may already be detached from its element.
    const element = map.getTargetElement();
    const hitAt = (event: MapBrowserEvent) =>
      map.forEachFeatureAtPixel(event.pixel, feature => feature, {
        layerFilter: candidate => candidate === layer,
        hitTolerance: 6,
      });

    const removeVertex = (index: number) => {
      if (readOnly) return;
      const { collection, selectedId } = store.getSnapshot();
      const shape = GeoUtils.findFeature(collection, selectedId)?.geometry;
      if (!selectedId || !shape) return;
      const next = GeoUtils.removeVertex(shape, index);
      if (next) {
        store.setGeometry(selectedId, next, EditOrigin.MAP);
        return;
      }
      Notification.warning({
        message:
          shape.type === GeometryKind.POLYGON
            ? t("A polygon needs at least 3 vertices.")
            : t("A line needs at least 2 vertices."),
        placement: "bottomLeft",
      });
    };

    const handleClick = (event: MapBrowserEvent) => {
      // A vertex of the selected line or polygon: a click selects it, an Alt-click removes it.
      const geometry = handles.selected.item(0)?.getGeometry();
      const altKey = event.originalEvent instanceof MouseEvent && event.originalEvent.altKey;
      if (geometry && geometry.getType() !== GeometryKind.POINT) {
        const index = vertexIndexAt(map, geometry, event.pixel);
        if (index !== null) {
          if (altKey) removeVertex(index);
          else store.selectVertex(index);
          return;
        }
      }
      const hit = hitAt(event);
      const id = hit ? String(hit.getId()) : null;
      // Clicking the selected shape away from its vertices keeps the shape, drops the vertex.
      if (id !== null && id === store.getSnapshot().selectedId) store.selectVertex(null);
      else store.select(id);
    };
    const handleMove = (event: MapBrowserEvent) => {
      if (event.dragging || !element) return;
      const selectedFeature = handles.selected.item(0);
      const geometry = selectedFeature?.getGeometry();
      if (geometry && handleAt(map, geometry, event.pixel)) {
        element.style.cursor = "grab";
        return;
      }
      const hit = hitAt(event);
      element.style.cursor = !hit ? "" : hit === selectedFeature ? "move" : "pointer";
    };
    map.on("click", handleClick);
    map.on("pointermove", handleMove);
    return () => {
      map.un("click", handleClick);
      map.un("pointermove", handleMove);
      if (element) element.style.cursor = "";
    };
  }, [handles, readOnly, store, t, tool]);

  useEffect(() => {
    if (!handles || drawType(tool) === null) return;
    const element = handles.map.getTargetElement();
    if (!element) return;
    element.style.cursor = "crosshair";
    return () => {
      element.style.cursor = "";
    };
  }, [handles, tool]);
}
