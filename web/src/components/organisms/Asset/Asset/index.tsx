import { useParams } from "react-router-dom";

import AssetBody from "@reearth-cms/components/molecules/Asset/Asset/AssetBody";
import AssetHeader from "@reearth-cms/components/molecules/Asset/Asset/AssetHeader";

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

  const handleSave = async () => {
    if (assetId) {
      await updateAsset(assetId, selectedPreviewType);
    }
  };

  return isLoading ? (
    <>loading...</>
  ) : asset ? (
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
  ) : (
    <>not found</>
  );
};

export default Asset;
