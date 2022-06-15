import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default () => {
  const { assetId } = useParams();
  const [asset, setAsset] = useState<Asset>({} as Asset);

  const getAsset = (_assetId?: string | undefined): Asset => {
    const assetNode: Asset = {
      contentType: "GIS/3DTiles",
      createdAt: new Date(),
      id: "1",
      name: "tileset.gis",
      size: 0,
      url: "https://plateau.reearth.io/13101_chiyoda-ku/tileset.json",
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
