import type { FeatureCollection } from "geojson";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import type Geometry from "ol/geom/Geometry";
import type VectorSource from "ol/source/Vector";
import { useEffect, useRef } from "react";

/** The store is WGS84; the map renders in Web Mercator. */
export const GEOJSON_FORMAT = new GeoJSON({
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
});

/**
 * Store -> map, by diff. Untouched features are left alone and changed ones are mutated
 * in place, so Modify/Translate never lose the feature they are dragging.
 */
export function useMapSync(source: VectorSource | null, collection: FeatureCollection) {
  const appliedRef = useRef<Map<string, string>>(new Map());
  const sourceRef = useRef<VectorSource | null>(null);

  useEffect(() => {
    if (!source) return;
    if (sourceRef.current !== source) {
      appliedRef.current.clear();
      sourceRef.current = source;
    }
    const applied = appliedRef.current;
    const present = new Set<string>();

    for (const feature of collection.features) {
      // A feature without geometry has nothing to draw; treating it as absent also
      // removes whatever was drawn for it before.
      if (!feature.geometry) continue;
      const id = String(feature.id);
      present.add(id);
      const signature = JSON.stringify(feature.geometry);
      if (applied.get(id) === signature) continue;

      const geometry = GEOJSON_FORMAT.readGeometry(feature.geometry) as Geometry;
      const existing = source.getFeatureById(id);
      if (existing) {
        existing.setGeometry(geometry);
      } else {
        const created = new Feature<Geometry>({ geometry });
        created.setId(id);
        source.addFeature(created);
      }
      applied.set(id, signature);
    }

    for (const id of [...applied.keys()]) {
      if (present.has(id)) continue;
      const stale = source.getFeatureById(id);
      if (stale) source.removeFeature(stale);
      applied.delete(id);
    }
  }, [source, collection]);
}
