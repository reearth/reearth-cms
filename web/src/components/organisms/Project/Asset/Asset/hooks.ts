import { NetworkStatus } from "@apollo/client";
import { Ion, Viewer as CesiumViewer } from "cesium";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  Asset,
  AssetItem,
  PreviewType,
  ViewerType,
  AssetFile,
} from "@reearth-cms/components/molecules/Asset/types";
import {
  geoFormats,
  geo3dFormats,
  geoMvtFormat,
  model3dFormats,
  csvFormats,
  imageFormats,
  imageSVGFormat,
  compressedFileFormats,
} from "@reearth-cms/components/molecules/Common/Asset";
import { fromGraphQLAsset } from "@reearth-cms/components/organisms/DataConverters/content";
import { config } from "@reearth-cms/config";
import {
  Asset as GQLAsset,
  PreviewType as GQLPreviewType,
  useDecompressAssetMutation,
  useGetAssetFileQuery,
  useGetAssetItemQuery,
  useUpdateAssetMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useUserId, useUserRights } from "@reearth-cms/state";
import { getExtension } from "@reearth-cms/utils/file";

export default (assetId?: string) => {
  const t = useT();
  const [userId] = useUserId();
  const [userRights] = useUserRights();
  const navigate = useNavigate();
  const { workspaceId, projectId } = useParams();
  const location = useLocation();
  const [selectedPreviewType, setSelectedPreviewType] = useState<PreviewType>("IMAGE");
  const [decompressing, setDecompressing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState(true);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  const { data: rawAsset, networkStatus } = useGetAssetItemQuery({
    variables: {
      assetId: assetId ?? "",
    },
    fetchPolicy: "cache-and-network",
  });

  const { data: rawFile, loading: fileLoading } = useGetAssetFileQuery({
    variables: {
      assetId: assetId ?? "",
    },
    fetchPolicy: "cache-and-network",
  });

  const convertedAsset: Asset | undefined = useMemo(() => {
    return rawAsset?.node?.__typename === "Asset"
      ? fromGraphQLAsset(rawAsset.node as GQLAsset)
      : undefined;
  }, [rawAsset]);

  const asset = useMemo(() => {
    return convertedAsset
      ? {
          ...convertedAsset,
          ...(convertedAsset && rawFile?.assetFile
            ? {
                file: rawFile?.assetFile as AssetFile,
              }
            : {}),
        }
      : undefined;
  }, [convertedAsset, rawFile?.assetFile]);

  const hasUpdateRight = useMemo(
    () =>
      userRights?.asset.update === null
        ? asset?.createdBy.id === userId
        : !!userRights?.asset.update,
    [asset?.createdBy.id, userId, userRights?.asset.update],
  );

  const [updateAssetMutation, { loading: updateLoading }] = useUpdateAssetMutation();
  const handleAssetUpdate = useCallback(
    async (assetId: string, previewType?: PreviewType) => {
      if (!assetId) return;
      const result = await updateAssetMutation({
        variables: { id: assetId, previewType: previewType as GQLPreviewType },
        refetchQueries: ["GetAssetItem"],
      });
      if (result.errors || !result.data?.updateAsset) {
        Notification.error({ message: t("Failed to update asset.") });
      }
      if (result) {
        Notification.success({ message: t("Asset was successfully updated!") });
      }
    },
    [t, updateAssetMutation],
  );

  const [decompressAssetMutation] = useDecompressAssetMutation();
  const handleAssetDecompress = useCallback(
    (assetId: string) =>
      (async () => {
        if (!assetId) return;
        setDecompressing(true);
        const result = await decompressAssetMutation({
          variables: { assetId },
          refetchQueries: ["GetAssetItem"],
        });
        setDecompressing(false);
        if (result.errors || !result.data?.decompressAsset) {
          Notification.error({ message: t("Failed to decompress asset.") });
        }
        if (result) {
          Notification.success({ message: t("Asset is being decompressed!") });
        }
      })(),
    [t, decompressAssetMutation, setDecompressing],
  );

  useEffect(() => {
    if (convertedAsset?.previewType) {
      setSelectedPreviewType(convertedAsset.previewType);
    }
  }, [convertedAsset?.previewType]);

  const handleTypeChange = useCallback(
    (value: PreviewType) => {
      setSelectedPreviewType(value);
      setIsSaveDisabled(value === convertedAsset?.previewType);
    },
    [convertedAsset?.previewType],
  );

  const [viewerType, setViewerType] = useState<ViewerType>("unknown");
  const assetFileExt = getExtension(convertedAsset?.fileName);

  useEffect(() => {
    switch (true) {
      case selectedPreviewType === "GEO" &&
        (geoFormats.includes(assetFileExt) || compressedFileFormats.includes(assetFileExt)):
        setViewerType("geo");
        break;
      case selectedPreviewType === "GEO_3D_TILES" &&
        (geo3dFormats.includes(assetFileExt) || compressedFileFormats.includes(assetFileExt)):
        setViewerType("geo_3d_tiles");
        break;
      case selectedPreviewType === "GEO_MVT" &&
        (geoMvtFormat.includes(assetFileExt) || compressedFileFormats.includes(assetFileExt)):
        setViewerType("geo_mvt");
        break;
      case selectedPreviewType === "MODEL_3D" &&
        (model3dFormats.includes(assetFileExt) || compressedFileFormats.includes(assetFileExt)):
        setViewerType("model_3d");
        break;
      case selectedPreviewType === "CSV" && csvFormats.includes(assetFileExt):
        setViewerType("csv");
        break;
      case selectedPreviewType === "IMAGE" && imageFormats.includes(assetFileExt):
        setViewerType("image");
        break;
      case selectedPreviewType === "IMAGE_SVG" && imageSVGFormat.includes(assetFileExt):
        setViewerType("image_svg");
        break;
      default:
        setViewerType("unknown");
        break;
    }
  }, [convertedAsset?.previewType, assetFileExt, selectedPreviewType]);

  const displayUnzipFileList = useMemo(
    () => compressedFileFormats.includes(assetFileExt),
    [assetFileExt],
  );

  const viewerRef = useRef<CesiumViewer>();

  const handleGetViewer = (viewer?: CesiumViewer) => {
    viewerRef.current = viewer;
  };

  const handleFullScreen = useCallback(() => {
    if (viewerType === "unknown") {
      return;
    } else if (viewerType === "image" || viewerType === "image_svg") {
      setIsModalVisible(true);
    } else {
      viewerRef.current?.canvas.requestFullscreen();
    }
  }, [viewerType]);

  const handleAssetItemSelect = useCallback(
    (assetItem: AssetItem) => {
      navigate(
        `/workspace/${workspaceId}/project/${projectId}/content/${assetItem.modelId}/details/${assetItem.itemId}`,
      );
    },
    [navigate, projectId, workspaceId],
  );

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleToggleCommentMenu = useCallback(
    (value: boolean) => {
      setCollapsed(value);
    },
    [setCollapsed],
  );

  useEffect(() => {
    Ion.defaultAccessToken = config()?.cesiumIonAccessToken ?? Ion.defaultAccessToken;
  }, []);

  const handleSave = useCallback(async () => {
    if (assetId) {
      setIsSaveDisabled(true);
      try {
        await handleAssetUpdate(assetId, selectedPreviewType);
      } catch (_) {
        setIsSaveDisabled(false);
      }
    }
  }, [assetId, handleAssetUpdate, selectedPreviewType]);

  const handleBack = useCallback(() => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/asset/`, { state: location.state });
  }, [location.state, navigate, projectId, workspaceId]);

  return {
    asset,
    assetFileExt,
    isLoading: networkStatus === NetworkStatus.loading || fileLoading,
    selectedPreviewType,
    isModalVisible,
    collapsed,
    viewerType,
    displayUnzipFileList,
    decompressing,
    isSaveDisabled,
    updateLoading,
    hasUpdateRight,
    handleAssetItemSelect,
    handleAssetDecompress,
    handleToggleCommentMenu,
    handleTypeChange,
    handleModalCancel,
    handleFullScreen,
    handleSave,
    handleBack,
    handleGetViewer,
  };
};
