import { useState, useCallback, Dispatch, SetStateAction } from "react";

import { UploadFile } from "@reearth-cms/components/atoms/Upload";

export default (
  fileList: UploadFile[],
  createAssets: (files: UploadFile[]) => Promise<void>,
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
    await createAssets(fileList);
    hideUploadModal();
    // TODO: link the uploaded asset with content after uploading is done
  }, [createAssets, fileList, hideUploadModal, setUploading]);

  return {
    visible,
    handleClick,
    handleCancel,
    displayUploadModal,
    hideUploadModal,
    handleUpload,
  };
};
