import { useCallback, useEffect, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Asset, PreviewType } from "@reearth-cms/components/molecules/Asset/asset.type";
import { viewerRef } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/Asset";
import {
  Asset as GQLAsset,
  PreviewType as GQLPreviewType,
  useGetAssetQuery,
  useUpdateAssetMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

import { convertAsset } from "../convertAsset";

export default (assetId?: string) => {
  const t = useT();
  const [selectedPreviewType, setSelectedPreviewType] = useState<PreviewType>("IMAGE");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState(true);

  const { data: rawAsset, loading } = useGetAssetQuery({
    variables: {
      assetId: assetId ?? "",
    },
  });

  const asset: Asset | undefined = useMemo(() => {
    return convertAsset(rawAsset?.asset as GQLAsset);
  }, [rawAsset]);

  const [updateAssetMutation] = useUpdateAssetMutation();
  const handleAssetUpdate = useCallback(
    (assetId: string, previewType?: PreviewType) =>
      (async () => {
        if (!assetId) return;
        const result = await updateAssetMutation({
          variables: { id: assetId, previewType: previewType as GQLPreviewType },
          refetchQueries: ["GetAsset"],
        });
        if (result.errors || !result.data?.updateAsset) {
          Notification.error({ message: t("Failed to update asset.") });
        }
        if (result) {
          Notification.success({ message: t("Asset was successfully updated!") });
        }
      })(),
    [t, updateAssetMutation],
  );

  useEffect(() => {
    if (asset?.previewType) {
      setSelectedPreviewType(asset.previewType);
    }
  }, [asset?.previewType]);

  const handleTypeChange = useCallback((value: PreviewType) => {
    setSelectedPreviewType(value);
  }, []);

  const isTileSetPreviewVisible =
    selectedPreviewType === "GEO" ||
    selectedPreviewType === "GEO3D" ||
    selectedPreviewType === "MODEL3D";

  const handleFullScreen = useCallback(() => {
    if (isTileSetPreviewVisible) {
      viewerRef?.canvas.requestFullscreen();
    } else {
      setIsModalVisible(true);
    }
  }, [isTileSetPreviewVisible]);

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleToggleCommentMenu = useCallback(
    (value: boolean) => {
      setCollapsed(value);
    },
    [setCollapsed],
  );

  return {
    asset,
    isLoading: loading,
    selectedPreviewType,
    isModalVisible,
    collapsed,
    isTileSetPreviewVisible,
    handleToggleCommentMenu,
    handleAssetUpdate,
    handleTypeChange,
    handleModalCancel,
    handleFullScreen,
  };
};
