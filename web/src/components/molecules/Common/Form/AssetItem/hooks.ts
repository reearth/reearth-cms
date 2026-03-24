import { useState, useCallback, useMemo } from "react";

import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import { useProject, useWorkspace, useUserRights } from "@reearth-cms/state";

export default (
  fileList?: UploadFile[],
  uploadUrl?: { url: string; autoUnzip: boolean },
  uploadType?: UploadType,
  onAssetsCreate?: (files: UploadFile[]) => Promise<(Asset | undefined)[]>,
  onAssetCreateFromUrl?: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>,
  setUploadModalVisibility?: (visible: boolean) => void,
  onAssetsGet?: () => void,
  onChange?: (value: string) => void,
) => {
  const [currentWorkspace] = useWorkspace();
  const [currentProject] = useProject();
  const [userRights] = useUserRights();
  const hasCreateRight = useMemo(() => !!userRights?.asset.create, [userRights?.asset.create]);

  const [visible, setVisible] = useState(false);
  const handleClick = useCallback(() => {
    setVisible(true);
    onAssetsGet?.();
  }, [onAssetsGet]);

  const handleLinkAssetModalCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const displayUploadModal = useCallback(() => {
    setUploadModalVisibility?.(true);
  }, [setUploadModalVisibility]);

  const handleAssetUpload = useCallback(async () => {
    if (uploadType === "url" && uploadUrl) {
      return (await onAssetCreateFromUrl?.(uploadUrl.url, uploadUrl.autoUnzip)) ?? undefined;
    } else if (fileList) {
      const assets = await onAssetsCreate?.(fileList);
      return assets && assets?.length > 0 ? assets[0] : undefined;
    }
  }, [fileList, onAssetCreateFromUrl, onAssetsCreate, uploadType, uploadUrl]);

  const handleUploadAndLink = useCallback(async () => {
    const asset = await handleAssetUpload();
    if (asset) onChange?.(asset.id);
  }, [handleAssetUpload, onChange]);

  return {
    visible,
    workspaceId: currentWorkspace?.id,
    projectId: currentProject?.id,
    hasCreateRight,
    handleClick,
    handleLinkAssetModalCancel,
    displayUploadModal,
    handleUploadAndLink,
  };
};
