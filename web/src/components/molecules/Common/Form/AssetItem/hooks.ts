import { useState, useCallback, Dispatch, SetStateAction } from "react";

import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";

export default (
  fileList: UploadFile[],
  uploadUrl: string,
  uploadType: UploadType,
  onAssetCreate: (files: UploadFile[]) => Promise<void>,
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>,
  hideUploadModal: () => void,
  setUploading: Dispatch<SetStateAction<boolean>>,
  setUploadModalVisibility: Dispatch<SetStateAction<boolean>>,
) => {
  const [visible, setVisible] = useState(false);
  const handleClick = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  const handleCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const displayUploadModal = useCallback(() => {
    setUploadModalVisibility(true);
  }, [setUploadModalVisibility]);

  const handleUpload = useCallback(async () => {
    setUploading(true);

    try {
      switch (uploadType) {
        case "url":
          await onAssetCreateFromUrl(uploadUrl);
          break;
        case "local":
        default:
          await onAssetCreate(fileList);
          break;
      }
      hideUploadModal();
      // TODO: link the uploaded asset with content after uploading is done
    } catch (error) {
      hideUploadModal();
    }
  }, [
    setUploading,
    uploadType,
    hideUploadModal,
    onAssetCreateFromUrl,
    uploadUrl,
    onAssetCreate,
    fileList,
  ]);

  return {
    visible,
    handleClick,
    handleCancel,
    displayUploadModal,
    handleUpload,
  };
};
