import { Cartesian3 } from "cesium";
import { useCallback, useEffect } from "react";
import { useCesium } from "resium";

import mapPin from "@reearth-cms/components/atoms/Icon/Icons/mapPin.svg";

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
    const res = await fetch(url, {
      method: "GET",
    });
    if (res.status !== 200) {
      return;
    }
    return await res.text();
  }, [url]);

  const csvTextToObjects = useCallback((text: string) => {
    const result = [];
    const lines = text.split(/\r\n|\n|\r/);
    const headers = lines[0].split(",");
    for (let i = 1; i < lines.length; i++) {
      const obj: GeoObj = {};
      const line = lines[i].split(",");
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = line[j];
      }
      result.push(obj);
    }
    return result;
  }, []);

  const pointAdd = useCallback(
    (objects: GeoObj[]) => {
      for (const obj of objects) {
        if (obj.lng && obj.lat) {
          viewer?.entities.add({
            position: Cartesian3.fromDegrees(Number(obj.lng), Number(obj.lat)),
            billboard: {
              image: mapPin,
              width: 30,
              height: 30,
            },
          });
        } else {
          break;
        }
      }
    },
    [viewer?.entities],
  );

  const pointRender = useCallback(async () => {
    const text = await dataFetch();
    if (text) {
      pointAdd(csvTextToObjects(text));
    }
  }, [csvTextToObjects, dataFetch, pointAdd]);

  useEffect(() => {
    pointRender();
  }, [pointRender]);

  return null;
};
