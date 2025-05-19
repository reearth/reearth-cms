import { Cartesian3 } from "cesium";
import { useCallback, useEffect } from "react";
import { useCesium } from "resium";

import { waitForViewer } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/waitForViewer";
import { useAuthHeader } from "@reearth-cms/gql";

import mapPin from "./mapPin.svg";

type Props = {
  isAssetPublic?: boolean;
  url: string;
};

type GeoObj = {
  lng?: string;
  lat?: string;
  [x: string]: string | undefined;
};

export const Imagery: React.FC<Props> = ({ isAssetPublic, url }) => {
  const { viewer } = useCesium();
  const { getHeader } = useAuthHeader();

  const dataFetch = useCallback(async () => {
    try {
      const headers = await getHeader();
      const res = await fetch(url, {
        method: "GET",
        headers: isAssetPublic ? {} : headers,
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
      const resolvedViewer = await waitForViewer(viewer);
      resolvedViewer.entities.removeAll();
      for (const obj of objects) {
        if (obj.lng && obj.lat) {
          resolvedViewer.entities.add({
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
      resolvedViewer.zoomTo(resolvedViewer.entities);
    },
    [viewer],
  );

  useEffect(() => {
    const loadAndRenderData = async () => {
      const text = await dataFetch();
      if (text) await addPointsToViewer(parseCsv(text));
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
