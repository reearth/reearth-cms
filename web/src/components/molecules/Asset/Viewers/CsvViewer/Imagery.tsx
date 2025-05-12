import { Cartesian3 } from "cesium";
import { useCallback, useEffect } from "react";
import { useCesium } from "resium";

import mapPin from "./mapPin.svg";

type Props = {
  url: string;
};

type GeoObj = {
  lng?: string;
  lat?: string;
  [x: string]: string | undefined;
};

export const Imagery: React.FC<Props> = ({ url }) => {
  const { viewer } = useCesium();

  const dataFetch = useCallback(async () => {
    try {
      const res = await fetch(url, {
        method: "GET",
      });
      if (!res.ok) {
        throw new Error("Error loading CSV data");
      }
      return await res.text();
    } catch (err) {
      console.error(err);
    }
  }, [url]);

  const parseCsv = useCallback((text: string): GeoObj[] => {
    const result: GeoObj[] = [];
    const lines = text.split(/\r\n|\n|\r/);
    const headers = lines[0].split(",");
    lines.forEach((line, index) => {
      if (index === 0) return;
      const obj: GeoObj = {};
      const columns = line.split(",");
      headers.forEach((header, headerIndex) => {
        obj[header] = columns[headerIndex];
      });
      result.push(obj);
    });
    return result;
  }, []);

  const addPointsToViewer = useCallback(
    (objects: GeoObj[]) => {
      if (!viewer) return;
      viewer.entities.removeAll();
      for (const obj of objects) {
        if (obj.lng && obj.lat) {
          viewer.entities.add({
            position: Cartesian3.fromDegrees(Number(obj.lng), Number(obj.lat)),
            billboard: {
              image: mapPin,
              width: 30,
              height: 30,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            properties: obj,
          });
        }
      }
      viewer.zoomTo(viewer.entities);
    },
    [viewer],
  );

  useEffect(() => {
    const loadAndRenderData = async () => {
      const text = await dataFetch();
      if (text) addPointsToViewer(parseCsv(text));
    };
    loadAndRenderData();

    return () => {
      if (viewer) {
        viewer.entities.removeAll();
      }
    };
  }, [dataFetch, parseCsv, addPointsToViewer, viewer]);

  return null;
};
