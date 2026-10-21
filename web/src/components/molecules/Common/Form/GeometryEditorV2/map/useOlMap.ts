import Collection from "ol/Collection";
import { Attribution, defaults as defaultControls } from "ol/control";
import { platformModifierKeyOnly } from "ol/events/condition";
import type Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import { defaults as defaultInteractions, MouseWheelZoom } from "ol/interaction";
import type TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OlMap from "ol/Map";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import View from "ol/View";
import "ol/ol.css";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { BaseMapId, createBaseLayer } from "./baseMaps";
import { featureStyle, searchPinStyle } from "./mapStyle";

export type MapHandles = {
  readonly map: OlMap;
  readonly source: VectorSource;
  readonly layer: VectorLayer;
  readonly pinSource: VectorSource;
  readonly bases: ReadonlyMap<BaseMapId, TileLayer>;
  /** Editable shapes currently selected; Translate and Modify act on these. */
  readonly selected: Collection<Feature<Geometry>>;
};

/** Japan, as the existing field opens. */
export const DEFAULT_VIEW = { center: fromLonLat([137.5, 37.5]), zoom: 4.6 };

export function useOlMap(
  containerRef: RefObject<HTMLDivElement | null>,
  { preview, selectedIdRef }: { preview: boolean; selectedIdRef: RefObject<string | null> },
): MapHandles | null {
  const [handles, setHandles] = useState<MapHandles | null>(null);
  const selectedRef = useRef(selectedIdRef);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const source = new VectorSource();
    const layer = new VectorLayer({
      source,
      style: feature => featureStyle(feature, selectedRef.current.current),
    });
    const pinSource = new VectorSource();
    const pinLayer = new VectorLayer({ source: pinSource, style: searchPinStyle });
    const bases = new Map(
      [BaseMapId.OSM, BaseMapId.GSI_PALE].map(id => {
        const base = createBaseLayer(id);
        base.setVisible(id === BaseMapId.OSM);
        return [id, base] as const;
      }),
    );

    const map = new OlMap({
      target: container,
      layers: [...bases.values(), layer, pinLayer],
      view: new View(DEFAULT_VIEW),
      controls: defaultControls({ zoom: false, rotate: false, attribution: false }).extend([
        new Attribution({ collapsible: false }),
      ]),
      interactions: defaultInteractions({
        doubleClickZoom: false,
        // Inside a scrolling form the wheel belongs to the page unless ⌘/Ctrl is held.
        mouseWheelZoom: !preview,
      }).extend(preview ? [new MouseWheelZoom({ condition: platformModifierKeyOnly })] : []),
    });

    // OpenLayers measures its container once; expand/collapse and splitters need a re-measure.
    const observer = new ResizeObserver(() => map.updateSize());
    observer.observe(container);

    setHandles({
      map,
      source,
      layer,
      pinSource,
      bases,
      selected: new Collection<Feature<Geometry>>(),
    });

    return () => {
      observer.disconnect();
      map.setTarget(undefined);
      map.dispose();
      setHandles(null);
    };
  }, [containerRef, preview]);

  return handles;
}
