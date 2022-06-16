import { AssetType } from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/asset-type-select";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default () => {
  const { assetId } = useParams();
  const [asset, setAsset] = useState<Asset>({} as Asset);
  const [selectedContentType, setSelectedContentType] = useState<string>("");

  const getAsset = (_assetId?: string | undefined): Asset => {
    const assetNode: Asset = {
      contentType: AssetType.JSON,
      createdAt: new Date(),
      id: "1",
      name: "tileset.json",
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

  useEffect(() => {
    if (asset.contentType) {
      setSelectedContentType(asset.contentType);
    }
  }, [asset.contentType]);

  const handleTypeChange = useCallback((value: AssetType) => {
    setSelectedContentType(value);
  }, []);

  return {
    asset,
    assetId,
    selectedContentType,
    handleTypeChange,
  };
};
