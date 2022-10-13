import styled from "@emotion/styled";
import { useParams } from "react-router-dom";

import AssetBody from "@reearth-cms/components/molecules/Asset/Asset/AssetBody";
import AssetHeader from "@reearth-cms/components/molecules/Asset/Asset/AssetHeader";
import CommentsSider from "@reearth-cms/components/organisms/CommentsSider";

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
    // TODO: need to add a spinner
    <Wrapper>loading...</Wrapper>
  ) : asset ? (
    <>
      <Wrapper>
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
        />
      </Wrapper>
      <CommentsSider threadId={asset.fileName} />
    </>
  ) : (
    <Wrapper>not found</Wrapper>
  );
};

const Wrapper = styled.div`
  margin: 16px;
  background-color: white;
  min-height: 100%;
  flex: 1;
`;

export default Asset;
