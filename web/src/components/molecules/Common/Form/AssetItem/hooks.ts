import { useState, useCallback, Dispatch, SetStateAction } from "react";

import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";

export default (
  fileList: UploadFile[],
  createAssets: (files: UploadFile[]) => Promise<(Asset | undefined)[]>,
  onLink: (asset?: Asset) => void,
  setFileList: Dispatch<SetStateAction<UploadFile<File>[]>>,
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

  const hideUploadModal = useCallback(() => {
    setUploadModalVisibility(false);
    setUploading(false);
    setFileList([]);
  }, [setFileList, setUploadModalVisibility, setUploading]);

  const handleUpload = useCallback(async () => {
    setUploading(true);
    const assets = await createAssets(fileList);
    if (assets?.length > 0) onLink(assets[0]);
    hideUploadModal();
  }, [createAssets, fileList, hideUploadModal, onLink, setUploading]);

  return {
    visible,
    handleClick,
    handleCancel,
    displayUploadModal,
    hideUploadModal,
    handleUpload,
  };
};
