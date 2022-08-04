import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "@reearth-cms/auth";
import { viewerRef } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/index";
import { Asset, PreviewType } from "@reearth-cms/gql/graphql-client-api";

export default () => {
  const { assetId } = useParams();
  const [asset, setAsset] = useState<Asset>({} as Asset);
  const [selectedPreviewType, setSelectedPreviewType] = useState<PreviewType>(PreviewType.Image);
  useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const { user } = useAuth();

  const getAsset = (_assetId?: string | undefined): Asset => {
    // TODO: this data is hardcoded, should be replace with actual data.
    const assetNode: Asset = {
      createdBy: user,
    } as Asset;
    return assetNode;
  };

  useEffect(() => {
    const assetNode: Asset = getAsset();
    setAsset(assetNode);
  }, []);

  useEffect(() => {
    if (asset.previewType) {
      setSelectedPreviewType(asset.previewType);
    }
  }, [asset.previewType]);

  const handleTypeChange = (value: PreviewType) => {
    setSelectedPreviewType(value);
  };

  const handleFullScreen = () => {
    if (selectedPreviewType === PreviewType.Geo) {
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
    selectedPreviewType,
    handleTypeChange,
    isModalVisible,
    handleModalCancel,
    handleFullScreen,
  };
};
