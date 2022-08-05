import AssetBody from "@reearth-cms/components/molecules/Asset/Asset/AssetBody";
import AssetHeader from "@reearth-cms/components/molecules/Asset/Asset/AssetHeader";

import useHooks from "./hooks";

const Asset: React.FC = () => {
  const {
    asset,
    assetId,
    selectedPreviewType,
    handleTypeChange,
    isModalVisible,
    handleModalCancel,
    handleFullScreen,
  } = useHooks();

  const handleSave = () => {
    console.log("save");
  };

  return (
    <>
      <AssetHeader
        title={`Asset/${assetId}`}
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
        url={asset?.hash}
      />
    </>
  );
};

export default Asset;
