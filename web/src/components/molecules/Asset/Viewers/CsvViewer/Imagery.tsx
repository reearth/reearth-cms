import { Cartesian3, Viewer as CesiumViewer } from "cesium";
import { RefObject, useCallback, useEffect } from "react";
import { CesiumComponentRef } from "resium";

import { useAuthHeader } from "@reearth-cms/gql";

import mapPin from "./mapPin.svg";

type Props = {
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
  isAssetPublic?: boolean;
  url: string;
};

type GeoObj = {
  lng?: string;
  lat?: string;
  [x: string]: string | undefined;
};

export const Imagery: React.FC<Props> = ({ viewerRef, isAssetPublic, url }) => {
  const { getHeader } = useAuthHeader();

  const dataFetch = useCallback(async () => {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: isAssetPublic ? {} : await getHeader(),
      });
      if (!res.ok) throw new Error("Error loading CSV data");
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
      const viewer = viewerRef?.current?.cesiumElement;
      viewer?.entities.removeAll();
      for (const obj of objects) {
        if (obj.lng && obj.lat) {
          viewer?.entities.add({
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
      viewer?.zoomTo(viewer?.entities);
    },
    [viewerRef],
  );

  useEffect(() => {
    const loadAndRenderData = async () => {
      const text = await dataFetch();
      if (text) await addPointsToViewer(parseCsv(text));
    };
    loadAndRenderData();
  }, [dataFetch, parseCsv, addPointsToViewer, viewerRef]);

  return null;
};
