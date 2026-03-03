import { Cartesian3 } from "cesium";
import { useCallback, useEffect } from "react";
import { useCesium } from "resium";

import { useAuthHeader } from "@reearth-cms/gql";

import mapPin from "./mapPin.svg";

type Props = {
  isAssetPublic?: boolean;
  url: string;
};

type GeoObj = {
  [x: string]: string | undefined;
  lat?: string;
  lng?: string;
};

export const Imagery: React.FC<Props> = ({ isAssetPublic, url }) => {
  const { viewer } = useCesium();
  const { getHeader } = useAuthHeader();

  const dataFetch = useCallback(async () => {
    try {
      const res = await fetch(url, {
        headers: isAssetPublic ? {} : await getHeader(),
        method: "GET",
      });
      if (!res.ok) {
        throw new Error("Error loading CSV data");
      }
      return await res.text();
    } catch (err) {
      console.error(err);
    }
  }, [getHeader, isAssetPublic, url]);

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
    async (objects: GeoObj[]) => {
      viewer?.entities.removeAll();
      for (const obj of objects) {
        if (obj.lng && obj.lat) {
          viewer?.entities.add({
            billboard: {
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              height: 30,
              image: mapPin,
              width: 30,
            },
            position: Cartesian3.fromDegrees(Number(obj.lng), Number(obj.lat)),
            properties: obj,
          });
        }
      }
      viewer?.zoomTo(viewer?.entities);
    },
    [viewer],
  );

  useEffect(() => {
    const loadAndRenderData = async () => {
      const text = await dataFetch();
      if (text) await addPointsToViewer(parseCsv(text));
    };
    loadAndRenderData();
  }, [dataFetch, parseCsv, addPointsToViewer, viewer]);

  return null;
};
