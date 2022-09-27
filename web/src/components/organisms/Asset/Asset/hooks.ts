import { useCallback, useEffect, useMemo, useState } from "react";

import { Asset, PreviewType } from "@reearth-cms/components/molecules/Asset/asset.type";
import { viewerRef } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/index";
import {
  Asset as GQLAsset,
  PreviewType as GQLPreviewType,
  useGetAssetQuery,
  useUpdateAssetMutation,
} from "@reearth-cms/gql/graphql-client-api";

import { convertAsset } from "../convertAsset";

export default (assetId?: string) => {
  const [selectedPreviewType, setSelectedPreviewType] = useState<PreviewType>("IMAGE");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const { data: rawAsset, loading } = useGetAssetQuery({
    variables: {
      assetId: assetId ?? "",
    },
  });

  const asset: Asset | undefined = useMemo(() => {
    return convertAsset(rawAsset?.asset as GQLAsset);
  }, [rawAsset]);

  const [updateAssetMutation] = useUpdateAssetMutation();
  const updateAsset = useCallback(
    (assetId: string, previewType?: PreviewType) =>
      (async () => {
        if (!assetId) return;
        const result = await updateAssetMutation({
          variables: { id: assetId, previewType: previewType as GQLPreviewType },
          refetchQueries: ["GetAsset"],
        });
        if (result.errors || !result.data?.updateAsset) {
          // TODO: notification
          console.log("Failed to update asset.");
        }
        if (result) {
          // TODO: notification
          console.log("Asset was successfully updated.");
        }
      })(),
    [updateAssetMutation],
  );

  useEffect(() => {
    if (asset?.previewType) {
      setSelectedPreviewType(asset.previewType);
    }
  }, [asset?.previewType]);

  const handleTypeChange = useCallback((value: PreviewType) => {
    setSelectedPreviewType(value);
  }, []);

  const handleFullScreen = useCallback(() => {
    if (selectedPreviewType === "GEO") {
      viewerRef?.canvas.requestFullscreen();
    } else {
      setIsModalVisible(true);
    }
  }, [selectedPreviewType]);

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

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
