import { useCallback, useEffect, useState } from "react";

import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { viewerRef } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/index";
import {
  PreviewType,
  useGetAssetQuery,
  useUpdateAssetMutation,
} from "@reearth-cms/gql/graphql-client-api";

export default (assetId?: string) => {
  const [asset, setAsset] = useState<Asset>({} as Asset);
  const [selectedPreviewType, setSelectedPreviewType] = useState<PreviewType>(PreviewType.Image);
  useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const { data, loading } = useGetAssetQuery({
    variables: {
      assetId: assetId ?? "",
    },
  });

  const [updateAssetMutation] = useUpdateAssetMutation();
  const updateAsset = useCallback(
    (assetId: string, previewType?: PreviewType) =>
      (async () => {
        if (!assetId) return;
        const result = await updateAssetMutation({
          variables: { id: assetId, previewType },
          refetchQueries: ["GetAsset"],
        });
        if (result.errors || !result.data?.updateAsset) {
          // TODO: notification
          alert("Failed to update asset.");
        }
        if (result) {
          // TODO: notification
          alert("Asset was successfully updated.");
        }
      })(),
    [updateAssetMutation],
  );

  useEffect(() => {
    const asset: Asset = data?.asset as Asset;
    setAsset(asset);
  }, [data?.asset]);

  useEffect(() => {
    if (asset.previewType) {
      setSelectedPreviewType(asset?.previewType);
    }
  }, [asset?.previewType]);

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
    updateAsset,
    isLoading: loading,
    selectedPreviewType,
    handleTypeChange,
    isModalVisible,
    handleModalCancel,
    handleFullScreen,
  };
};
