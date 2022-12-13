import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { useWorkspace, useProject } from "@reearth-cms/state";

export default (
  fileList: UploadFile[],
  uploadUrl: string,
  uploadType: UploadType,
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>,
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>,
  setUploadModalVisibility: (visible: boolean) => void,
  onChange?: (value: string) => void,
) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [currentWorkspace] = useWorkspace();
  const [currentProject] = useProject();
  const handleClick = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  const handleLinkAssetModalCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const displayUploadModal = useCallback(() => {
    setUploadModalVisibility(true);
  }, [setUploadModalVisibility]);

  const handleAssetUpload = useCallback(async () => {
    if (uploadType === "url") {
      return (await onAssetCreateFromUrl(uploadUrl)) ?? undefined;
    } else {
      const assets = await onAssetsCreate(fileList);
      return assets?.length > 0 ? assets[0] : undefined;
    }
  }, [fileList, onAssetCreateFromUrl, onAssetsCreate, uploadType, uploadUrl]);

  const handleUploadAndLink = useCallback(async () => {
    const asset = await handleAssetUpload();
    if (asset) onChange?.(asset.id);
  }, [handleAssetUpload, onChange]);

  const handleNavigateToAsset = (asset: Asset) => {
    navigate(`/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/asset/${asset.id}`);
  };

  return {
    visible,
    handleClick,
    handleLinkAssetModalCancel,
    displayUploadModal,
    handleUploadAndLink,
    handleNavigateToAsset,
  };
};
