import { useState, useCallback, Dispatch, SetStateAction } from "react";

import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";

export default (
  fileList: UploadFile[],
  uploadUrl: string,
  uploadType: UploadType,
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>,
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>,
  onUploadModalCancel: () => void,
  onLink: (asset?: Asset) => void,
  setUploading: Dispatch<SetStateAction<boolean>>,
  setUploadModalVisibility: Dispatch<SetStateAction<boolean>>,
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

  const handleUpload = useCallback(async () => {
    setUploading(true);
    let assets: (Asset | undefined)[] = [];
    let asset: Asset | undefined;
    try {
      switch (uploadType) {
        case "url":
          asset = await onAssetCreateFromUrl(uploadUrl);
          break;
        case "local":
        default:
          assets = await onAssetsCreate(fileList);
          if (assets.length > 0) asset = assets[0];
          break;
      }
      if (asset) onLink(asset);
      onUploadModalCancel();
    } catch (error) {
      onUploadModalCancel();
    }
  }, [
    setUploading,
    uploadType,
    onUploadModalCancel,
    onAssetCreateFromUrl,
    uploadUrl,
    onAssetsCreate,
    fileList,
    onLink,
  ]);

  return {
    visible,
    handleClick,
    handleLinkAssetModalCancel,
    displayUploadModal,
    handleUpload,
  };
};
