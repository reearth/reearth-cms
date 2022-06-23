import AssetBody from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody";
import AssetHeader from "@reearth-cms/components/molecules/AssetList/Asset/AssetHeader";

import useHooks from "./hooks";

type Props = {};

const Asset: React.FC<Props> = () => {
  const {
    asset,
    assetId,
    selectedContentType,
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
        selectedContentType={selectedContentType}
        handleTypeChange={handleTypeChange}
        isModalVisible={isModalVisible}
        handleModalCancel={handleModalCancel}
        handleFullScreen={handleFullScreen}
      />
    </>
  );
};

export default Asset;
