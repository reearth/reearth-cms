import Collection from "ol/Collection";
import { Attribution, defaults as defaultControls } from "ol/control";
import { platformModifierKeyOnly } from "ol/events/condition";
import type Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import { defaults as defaultInteractions, MouseWheelZoom } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OlMap from "ol/Map";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import View from "ol/View";
import "ol/ol.css";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { featureStyle, myLocationStyle, searchPinStyle } from "./mapStyle";

export type MapHandles = {
  readonly map: OlMap;
  readonly source: VectorSource<Feature<Geometry>>;
  readonly layer: VectorLayer;
  readonly pinSource: VectorSource;
  /** The user's location from "My location"; never part of the value. */
  readonly locationSource: VectorSource;
  /** The selected shape, when editable; Modify reshapes and Translate moves it. */
  readonly selected: Collection<Feature<Geometry>>;
};

/** Until the map is fitted to the value, or to the world when there is none. */
const INITIAL_VIEW = { center: fromLonLat([0, 20]), zoom: 2 };

export function useOlMap(
  containerRef: RefObject<HTMLDivElement | null>,
  {
    preview,
    selectedIdRef,
    selectedVertexRef,
  }: {
    preview: boolean;
    selectedIdRef: RefObject<string | null>;
    selectedVertexRef?: RefObject<number | null>;
  },
): MapHandles | null {
  const [handles, setHandles] = useState<MapHandles | null>(null);
  const selectedRef = useRef(selectedIdRef);
  const vertexRef = useRef(selectedVertexRef);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const source = new VectorSource<Feature<Geometry>>();
    const layer = new VectorLayer({
      source,
      style: feature =>
        featureStyle(feature, selectedRef.current.current, vertexRef.current?.current ?? null),
    });
    const pinSource = new VectorSource();
    const pinLayer = new VectorLayer({ source: pinSource, style: searchPinStyle });
    const locationSource = new VectorSource();
    const locationLayer = new VectorLayer({ source: locationSource, style: myLocationStyle });
    const map = new OlMap({
      target: container,
      layers: [new TileLayer({ source: new OSM() }), locationLayer, layer, pinLayer],
      view: new View(INITIAL_VIEW),
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
      locationSource,
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
