import { NetworkStatus } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Ion, Viewer as CesiumViewer } from "cesium";
import fileDownload from "js-file-download";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { CesiumComponentRef } from "resium";

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
import { useAuthHeader } from "@reearth-cms/gql";
import {
  DecompressAssetDocument,
  GetAssetDocument,
  GetAssetFileDocument,
  UpdateAssetDocument,
} from "@reearth-cms/gql/__generated__/assets.generated";
import {
  Asset as GQLAsset,
  PreviewType as GQLPreviewType,
} from "@reearth-cms/gql/__generated__/graphql.generated";
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
  const [selectedPreviewType, setSelectedPreviewType] = useState<PreviewType>();
  const [decompressing, setDecompressing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState(true);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  useEffect(() => {
    Ion.defaultAccessToken = config()?.cesiumIonAccessToken ?? Ion.defaultAccessToken;
  }, []);

  const { data: rawAsset, networkStatus } = useQuery(GetAssetDocument, {
    variables: {
      assetId: assetId ?? "",
    },
    fetchPolicy: "cache-and-network",
  });

  const { data: rawFile, loading: fileLoading } = useQuery(GetAssetFileDocument, {
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

  const [updateAssetMutation, { loading: updateLoading }] = useMutation(UpdateAssetDocument);
  const handleAssetUpdate = useCallback(
    async (assetId: string, previewType?: PreviewType) => {
      if (!assetId) return;
      const result = await updateAssetMutation({
        variables: { id: assetId, previewType: previewType as GQLPreviewType },
        refetchQueries: ["GetAssetItem"],
      });
      if (result.error || !result.data?.updateAsset) {
        Notification.error({ message: t("Failed to update asset.") });
      }
      if (result) {
        Notification.success({ message: t("Asset was successfully updated!") });
      }
    },
    [t, updateAssetMutation],
  );

  const [decompressAssetMutation] = useMutation(DecompressAssetDocument);
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
        if (result.error || !result.data?.decompressAsset) {
          Notification.error({ message: t("Failed to decompress asset.") });
        }
        if (result) {
          Notification.success({ message: t("Asset is being decompressed!") });
        }
      })(),
    [t, decompressAssetMutation],
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

  const assetFileExt = getExtension(convertedAsset?.fileName);

  const viewerType = useMemo((): ViewerType | undefined => {
    if (!selectedPreviewType || !assetFileExt) return;

    switch (true) {
      case selectedPreviewType === "GEO" &&
        (geoFormats.includes(assetFileExt) || compressedFileFormats.includes(assetFileExt)):
        return "geo";
      case selectedPreviewType === "GEO_3D_TILES" &&
        (geo3dFormats.includes(assetFileExt) || compressedFileFormats.includes(assetFileExt)):
        return "geo_3d_tiles";
      case selectedPreviewType === "GEO_MVT" &&
        (geoMvtFormat.includes(assetFileExt) || compressedFileFormats.includes(assetFileExt)):
        return "geo_mvt";
      case selectedPreviewType === "MODEL_3D" &&
        (model3dFormats.includes(assetFileExt) || compressedFileFormats.includes(assetFileExt)):
        return "model_3d";
      case selectedPreviewType === "CSV" && csvFormats.includes(assetFileExt):
        return "csv";
      case selectedPreviewType === "IMAGE" && imageFormats.includes(assetFileExt):
        return "image";
      case selectedPreviewType === "IMAGE_SVG" && imageSVGFormat.includes(assetFileExt):
        return "image_svg";
      default:
        return "unknown";
    }
  }, [assetFileExt, selectedPreviewType]);

  const displayUnzipFileList = useMemo(
    () => compressedFileFormats.includes(assetFileExt),
    [assetFileExt],
  );

  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);

  const handleFullScreen = useCallback(() => {
    if (viewerType === "unknown") {
      return;
    } else if (viewerType === "image" || viewerType === "image_svg") {
      setIsModalVisible(true);
    } else {
      viewerRef.current?.cesiumElement?.canvas.requestFullscreen();
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

  const { getHeader } = useAuthHeader();
  const handleSingleAssetDownload = async (asset: Asset) => {
    try {
      const headers = await getHeader();
      const response = await fetch(asset.url, {
        method: "GET",
        ...(asset.public ? {} : { headers }),
      });

      if (!response.ok) {
        throw new Error(`Failed to download ${asset.fileName}: HTTP ${response.status}`);
      }

      const blob = await response.blob();
      fileDownload(blob, asset.fileName);
      Notification.success({
        message: t("Download successful"),
        description: asset.fileName,
      });
    } catch (err) {
      console.error("Download error:", err);
      Notification.error({
        message: t("Download failed"),
        description: asset.fileName,
      });
    }
  };

  return {
    asset,
    assetFileExt,
    isLoading: networkStatus === NetworkStatus.loading || fileLoading,
    selectedPreviewType,
    isModalVisible,
    collapsed,
    viewerType,
    viewerRef,
    displayUnzipFileList,
    decompressing,
    isSaveDisabled,
    updateLoading,
    hasUpdateRight,
    handleAssetItemSelect,
    handleAssetDecompress,
    handleSingleAssetDownload,
    handleToggleCommentMenu,
    handleTypeChange,
    handleModalCancel,
    handleFullScreen,
    handleSave,
    handleBack,
  };
};
