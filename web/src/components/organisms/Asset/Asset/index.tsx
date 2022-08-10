import { useParams } from "react-router-dom";

import AssetBody from "@reearth-cms/components/molecules/Asset/Asset/AssetBody";
import AssetHeader from "@reearth-cms/components/molecules/Asset/Asset/AssetHeader";
import { hashToURL } from "@reearth-cms/utils/convert";

import useHooks from "./hooks";

const Asset: React.FC = () => {
  const { assetId } = useParams();
  const {
    asset,
    updateAsset,
    isLoading,
    selectedPreviewType,
    handleTypeChange,
    isModalVisible,
    handleModalCancel,
    handleFullScreen,
  } = useHooks(assetId);

  const url = hashToURL(asset?.hash);

  if (!asset) {
    return <>not found</>;
  }

  const handleSave = async () => {
    if (assetId) {
      await updateAsset(assetId, selectedPreviewType);
    }
  };

  return isLoading ? (
    <>loading...</>
  ) : (
    <>
      <AssetHeader
        title={`Asset/${asset?.fileName}`}
        subTitle="This is a subtitle"
        handleSave={handleSave}
      />
      <AssetBody
        asset={asset}
        selectedPreviewType={selectedPreviewType}
        handleTypeChange={handleTypeChange}
        isModalVisible={isModalVisible}
        handleModalCancel={handleModalCancel}
        handleFullScreen={handleFullScreen}
        url={url}
      />
    </>
  );
};

export default Asset;
