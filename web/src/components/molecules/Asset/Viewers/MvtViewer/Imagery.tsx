import styled from "@emotion/styled";
import { VectorTileFeature } from "@mapbox/vector-tile";
import {
  Cartesian3,
  ImageryLayer,
  ImageryLayerCollection,
  Math,
  Entity,
  CustomDataSource,
  Color,
} from "cesium";
import { MVTImageryProvider } from "cesium-mvt-imagery-provider";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useCesium } from "resium";

import Input from "@reearth-cms/components/atoms/Input";

type Props = {
  assetBaseUrl: string;
  handleProperties: (prop: Property) => void;
  selectFeature: (selected: boolean) => void;
};

export type Property = { [k: string]: string | number | boolean };

// TODO: these two types should be imported from cesium-mvt-imagery-provider library instead
type URLTemplate = `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`;
type TileCoordinates = {
  x: number;
  y: number;
  level: number;
};

export const Imagery: React.FC<Props> = ({ assetBaseUrl, handleProperties, selectFeature }) => {
  const { viewer } = useCesium();
  const [isFeatureSelected, setIsFeatureSelected] = useState<boolean>(false);
  const [urlTemplate, setUrlTemplate] = useState<URLTemplate>(assetBaseUrl as URLTemplate);
  const [layerName, setLayerName] = useState<string>("");

  const fetchMvtMetaData = useCallback(async () => {
    setUrlTemplate(`${assetBaseUrl}/{z}/{x}/{y}.mvt` as URLTemplate);
    const res = await fetch(`${assetBaseUrl}/metadata.json`);
    return res.ok ? await res?.json() : undefined;
  }, [assetBaseUrl]);

  const zoomTo = useCallback(
    async (x: number, y: number, z: number, range: number) => {
      const entity = new Entity({
        position: Cartesian3.fromDegrees(x, y, z),
        point: { pixelSize: 1, color: Color.TRANSPARENT },
      });
      const dataSource = new CustomDataSource();
      dataSource.entities.add(entity);
      viewer.dataSources.add(dataSource);
      await viewer.zoomTo(entity, {
        heading: Math.toRadians(90.0),
        pitch: Math.toRadians(-90.0),
        range: range,
      });
    },
    [viewer],
  );

  const setCameraPosition = useCallback(
    async (position: string) => {
      const regex =
        /[-]?[0-9]+[,.]?[0-9]*([/][0-9]+[,.]?[0-9]*)*,[-]?[0-9]+[,.]?[0-9]*([/][0-9]+[,.]?[0-9]*)*,[-]?[0-9]+[,.]?[0-9]*([/][0-9]+[,.]?[0-9]*)*/;
      if (position?.match(regex)) {
        const [x, y, z]: number[] = position.split(",").map((s: string) => Number(s));
        await zoomTo(x, y, z, 200000);
      } else {
        // default position
        await zoomTo(139.767052, 35.681167, 100, 3000000);
      }
    },
    [zoomTo],
  );

  const initViewer = useCallback(async () => {
    try {
      const data = await fetchMvtMetaData();
      if (data?.name) setLayerName(data.name);
      await setCameraPosition(data?.center);
    } catch (error) {
      // TODO: handle the error
      console.error(error);
    }
  }, [fetchMvtMetaData, setCameraPosition]);

  useEffect(() => {
    initViewer();
  }, [initViewer]);

  const style = useCallback(
    (_feature: VectorTileFeature, _tileCoords: TileCoordinates) => {
      if (isFeatureSelected) {
        return {
          strokeStyle: "orange",
          fillStyle: "orange",
          lineWidth: 1,
        };
      }
      return {
        strokeStyle: "red",
        fillStyle: "red",
        lineWidth: 1,
      };
    },
    [isFeatureSelected],
  );

  const onSelectFeature = useCallback(
    (feature: VectorTileFeature, _tileCoords: TileCoordinates) => {
      handleProperties(feature.properties);
      selectFeature(true);
      setIsFeatureSelected(v => !v);
    },
    [handleProperties, selectFeature],
  );

  useEffect(() => {
    const imageryProvider = new MVTImageryProvider({
      urlTemplate,
      layerName,
      style,
      onSelectFeature,
    });

    if (viewer) {
      const layers: ImageryLayerCollection = viewer.scene.imageryLayers;
      const currentLayer: ImageryLayer = layers.addImageryProvider(imageryProvider);
      currentLayer.alpha = 0.5;

      return () => {
        layers.remove(currentLayer);
      };
    }
  }, [
    viewer,
    isFeatureSelected,
    urlTemplate,
    layerName,
    handleProperties,
    selectFeature,
    onSelectFeature,
    style,
  ]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLayerName(e.target.value);
  }, []);

  return <StyledInput placeholder="Layer name" value={layerName} onChange={handleChange} />;
};

const StyledInput = styled(Input)`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 147px;
`;
