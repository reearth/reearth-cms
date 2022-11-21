import { useState, useCallback, Dispatch, SetStateAction } from "react";

import { UploadFile } from "@reearth-cms/components/atoms/Upload";

export default (
  fileList: UploadFile[],
  createAssets: (files: UploadFile[]) => Promise<void>,
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
    await createAssets(fileList);
    hideUploadModal();
    // TODO: link the uploaded asset with content after uploading is done
  }, [createAssets, fileList, hideUploadModal, setUploading]);

  return {
    visible,
    handleClick,
    handleCancel,
    displayUploadModal,
    handleUpload,
  };
};
