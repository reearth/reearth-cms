import { AssetType } from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/asset-type-select";
import { viewerRef } from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/index";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default () => {
  const { assetId } = useParams();
  const [asset, setAsset] = useState<Asset>({} as Asset);
  const [selectedContentType, setSelectedContentType] = useState<string>("");
  useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const getAsset = (_assetId?: string | undefined): Asset => {
    // TODO: this data is hardcodded, should be replace with actual data.
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

  const handleTypeChange = (value: AssetType) => {
    setSelectedContentType(value);
  };

  const handleFullScreen = () => {
    if (selectedContentType === AssetType.JSON) {
      viewerRef?.canvas.requestFullscreen();
    } else {
      setIsModalVisible(true);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return {
    asset,
    assetId,
    selectedContentType,
    handleTypeChange,
    isModalVisible,
    handleModalCancel,
    handleFullScreen,
  };
};
