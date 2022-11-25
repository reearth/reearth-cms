import { useState, useCallback } from "react";

import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";

export default (
  onLink: (asset?: Asset) => void,
  setUploadModalVisibility: (visible: boolean) => void,
  onUploadAndLink: (input: { alsoLink: boolean; onLink?: (_asset?: Asset) => void }) => void,
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

  const handleUploadAndLink = useCallback(async () => {
    onUploadAndLink({ alsoLink: true, onLink });
  }, [onUploadAndLink, onLink]);

  return {
    visible,
    handleClick,
    handleLinkAssetModalCancel,
    displayUploadModal,
    handleUploadAndLink,
  };
};
