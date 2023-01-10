import { useCallback, useEffect, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Asset, PreviewType, ViewerType } from "@reearth-cms/components/molecules/Asset/asset.type";
import { viewerRef } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/Asset";
import {
  geoFormats,
  geo3dFormats,
  model3dFormats,
  imageFormats,
  compressedFileFormats,
} from "@reearth-cms/components/molecules/Common/Asset";
import {
  Asset as GQLAsset,
  PreviewType as GQLPreviewType,
  useGetAssetQuery,
  useUpdateAssetMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { getExtension } from "@reearth-cms/utils/file";

import { convertAsset } from "../convertAsset";

export default (assetId?: string) => {
  const t = useT();
  const [selectedPreviewType, setSelectedPreviewType] = useState<PreviewType>("IMAGE");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState(true);

  const { data: rawAsset, loading } = useGetAssetQuery({
    variables: {
      assetId: assetId ?? "",
      withFiles: true,
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
          variables: { id: assetId, previewType: previewType as GQLPreviewType, withFiles: false },
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

  const [viewerType, setViewerType] = useState<ViewerType>("unsupported");
  const assetFileExt = getExtension(asset?.fileName);
  const isSVG = assetFileExt === "svg";

  useEffect(() => {
    switch (true) {
      case selectedPreviewType === "GEO" &&
        (geoFormats.includes(assetFileExt) || compressedFileFormats.includes(assetFileExt)):
        setViewerType("geo");
        break;
      case selectedPreviewType === "GEO3D" &&
        (geo3dFormats.includes(assetFileExt) || compressedFileFormats.includes(assetFileExt)):
        setViewerType("geo3d");
        break;
      case selectedPreviewType === "MODEL3D" &&
        (model3dFormats.includes(assetFileExt) || compressedFileFormats.includes(assetFileExt)):
        setViewerType("model3d");
        break;
      case selectedPreviewType === "IMAGE" && imageFormats.includes(assetFileExt):
        isSVG ? setViewerType("svg") : setViewerType("image");
        break;
      default:
        setViewerType("unsupported");
        break;
    }
  }, [asset?.previewType, assetFileExt, isSVG, selectedPreviewType]);

  const displayUnzipFileList = useMemo(
    () => compressedFileFormats.includes(assetFileExt),
    [assetFileExt],
  );

  const handleFullScreen = useCallback(() => {
    if (viewerType === "geo" || viewerType === "geo3d" || viewerType === "model3d") {
      viewerRef?.canvas.requestFullscreen();
    } else if (viewerType === "image" || viewerType === "svg") {
      setIsModalVisible(true);
    }
  }, [viewerType]);

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
    assetFileExt,
    isLoading: loading,
    selectedPreviewType,
    isModalVisible,
    collapsed,
    viewerType,
    displayUnzipFileList,
    handleToggleCommentMenu,
    handleAssetUpdate,
    handleTypeChange,
    handleModalCancel,
    handleFullScreen,
  };
};
