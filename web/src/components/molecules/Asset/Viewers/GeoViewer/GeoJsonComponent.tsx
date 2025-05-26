import { GeoJsonDataSource, Resource } from "cesium";
import { ComponentProps, useEffect, useState } from "react";
import { GeoJsonDataSource as ResiumGeoJsonDataSource, useCesium } from "resium";

import { useAuthHeader } from "@reearth-cms/gql";

type Props = ComponentProps<typeof ResiumGeoJsonDataSource> & {
  isAssetPublic?: boolean;
  url: string;
};

const GeoJsonComponent: React.FC<Props> = ({ isAssetPublic, url, ...props }) => {
  const { viewer } = useCesium();
  const { getHeader } = useAuthHeader();
  const [resource, setResource] = useState<Resource>();
  const [dataSource, setDataSource] = useState<GeoJsonDataSource>();

  useEffect(() => {
    if (resource || !url) return;

    const prepareResource = async () => {
      try {
        const headers = isAssetPublic ? {} : await getHeader();
        setResource(new Resource({ url, headers }));
      } catch (error) {
        console.error(error);
      }
    };
    prepareResource();
  }, [url, isAssetPublic, getHeader, resource]);

  useEffect(() => {
    if (!dataSource || !resource) return;

    const loadDataSource = async () => {
      try {
        await dataSource.load(resource);
        dataSource.show = true;
        viewer?.zoomTo(dataSource.entities);
      } catch (error) {
        console.error(error);
      }
    };
    loadDataSource();

    return () => {
      if (dataSource) {
        dataSource.entities.removeAll();
        viewer?.dataSources.remove(dataSource);
      }
    };
  }, [dataSource, resource, viewer]);

  return (
    <ResiumGeoJsonDataSource
      data={resource}
      clampToGround
      onLoad={ds => setDataSource(ds)}
      {...props}
    />
  );
};

export default GeoJsonComponent;
