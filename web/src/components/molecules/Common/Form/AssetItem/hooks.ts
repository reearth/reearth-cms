import { useState, useCallback } from "react";

import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";

export default (
  fileList: UploadFile[],
  uploadUrl: string,
  uploadType: UploadType,
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>,
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>,
  onLink: (asset?: Asset) => void,
  setUploadModalVisibility: (visible: boolean) => void,
) => {
  const [visible, setVisible] = useState(false);
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
    if (asset) onLink(asset);
  }, [handleAssetUpload, onLink]);

  return {
    visible,
    handleClick,
    handleLinkAssetModalCancel,
    displayUploadModal,
    handleUploadAndLink,
  };
};
