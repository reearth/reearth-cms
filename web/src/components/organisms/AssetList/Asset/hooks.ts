import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default () => {
  const { assetId } = useParams();
  const [asset, setAsset] = useState<Asset>({} as Asset);

  const getAsset = (_assetId?: string | undefined): Asset => {
    const assetNode: Asset = {
      contentType: "GIS/3D",
      createdAt: new Date(),
      id: "1",
      name: "filename.gis",
      size: 0,
      url: "http://placehold.jp/480x360.png",
      workspaceId: "",
      unzipFile: "",
      createdBy: "b.nour",
    };

    return assetNode;
  };

  useEffect(() => {
    const assetNode: Asset = getAsset();
    setAsset(assetNode);
  }, []);

  return {
    asset,
    assetId,
  };
};
