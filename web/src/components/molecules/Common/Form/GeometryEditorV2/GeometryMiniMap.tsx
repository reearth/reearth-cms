import styled from "@emotion/styled";
import type { FeatureCollection } from "geojson";
import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";

import { useLang } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { readFieldValue } from "./core/fieldValue";
import type { ReadResult } from "./core/fieldValue";
import { defaultExtent, extentOf, fitTo } from "./map/useMapFocus";
import { useMapSync } from "./map/useMapSync";
import { useOlMap } from "./map/useOlMap";
import ZoomHint from "./map/ZoomHint";

type Props = {
  value: string | string[];
  multiple: boolean;
  /** Shown instead of the map when the value can't be read. */
  fallback: ReactNode;
};

/** A read-only map of a stored geometry value, framed to fit it. */
const GeometryMiniMap: React.FC<Props> = ({ value, multiple, fallback }) => {
  // Every kind is accepted: this only shows what is stored, legacy fields included.
  const result = useMemo<ReadResult>(() => readFieldValue(value, multiple), [value, multiple]);
  return result.ok ? <MiniMap collection={result.collection} /> : <>{fallback}</>;
};

const MiniMap: React.FC<{ collection: FeatureCollection }> = ({ collection }) => {
  const lang = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIdRef = useRef<string | null>(null);
  const handles = useOlMap(containerRef, { preview: true, selectedIdRef });

  useMapSync(handles?.source ?? null, collection);

  useEffect(() => {
    if (!handles) return;
    const geometries = collection.features.flatMap(f => (f.geometry ? [f.geometry] : []));
    fitTo(handles, extentOf(geometries) ?? defaultExtent(lang), 16, 0);
  }, [handles, collection, lang]);

  return (
    <MapArea>
      <MapContainer ref={containerRef} />
      <ZoomHint />
    </MapArea>
  );
};

export default GeometryMiniMap;

const MapArea = styled.div`
  position: relative;
  width: 320px;
  height: 200px;
  border-radius: ${AntdToken.RADIUS.SM}px;
  overflow: hidden;
  border: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
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
