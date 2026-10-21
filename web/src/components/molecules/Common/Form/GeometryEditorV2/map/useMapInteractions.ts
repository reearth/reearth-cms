import type { Geometry as GeoJsonGeometry } from "geojson";
import type Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import Draw from "ol/interaction/Draw";
import type Interaction from "ol/interaction/Interaction";
import Modify from "ol/interaction/Modify";
import Snap from "ol/interaction/Snap";
import Translate from "ol/interaction/Translate";
import type MapBrowserEvent from "ol/MapBrowserEvent";
import { useEffect } from "react";
import type { RefObject } from "react";

import type { GeoStore, GeometryUpdate } from "../core/geoStore";
import { EditOrigin } from "../core/types";

import type { MapTool } from "./mapTools";
import { drawType } from "./mapTools";
import { GEOJSON_FORMAT } from "./useMapSync";
import type { MapHandles } from "./useOlMap";

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
  onDrawEnd: () => void;
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
  onDrawEnd,
  onReplaced,
}: Options) {
  useEffect(() => {
    if (!handles || readOnly) return;
    const { map, source, selected, editable } = handles;
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
      // As in the PoC, any line or polygon can be reshaped without selecting it first:
      // hover a border to add a vertex, drag a vertex to move it, Alt-click to remove it.
      // Multi* and GeometryCollection stay out of `editable` (proposal §3.4).
      // ol dispatches to the most recently added interaction first: Modify goes after
      // Translate so grabbing a vertex reshapes instead of moving the whole shape.
      const translate = new Translate({ features: selected });
      translate.on("translatestart", () => store.beginGesture());
      translate.on("translateend", event => {
        store.endGesture();
        commit(event.features.getArray());
      });
      register(translate);

      const modify = new Modify({ features: editable });
      modify.on("modifystart", () => store.beginGesture());
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
        onDrawEnd();
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
  }, [handles, store, tool, multiple, readOnly, drawRef, onDrawEnd, onReplaced]);

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

    const handleClick = (event: MapBrowserEvent) => {
      const hit = hitAt(event);
      store.select(hit ? String(hit.getId()) : null);
    };
    const handleMove = (event: MapBrowserEvent) => {
      if (event.dragging) return;
      if (element) element.style.cursor = hitAt(event) ? "pointer" : "";
    };
    map.on("click", handleClick);
    map.on("pointermove", handleMove);
    return () => {
      map.un("click", handleClick);
      map.un("pointermove", handleMove);
      if (element) element.style.cursor = "";
    };
  }, [handles, store, tool]);

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
