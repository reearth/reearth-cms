import styled from "@emotion/styled";
import { useNavigate, useParams } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Loading from "@reearth-cms/components/atoms/Loading";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import AssetBody from "@reearth-cms/components/molecules/Asset/Asset/AssetBody";
import CommentsSider from "@reearth-cms/components/organisms/CommentsSider";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const Asset: React.FC = () => {
  const t = useT();
  const navigate = useNavigate();
  const { workspaceId, projectId, assetId } = useParams();
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
  console.log(asset);

  const handleSave = async () => {
    if (assetId) {
      await updateAsset(assetId, selectedPreviewType);
    }
  };

  const handleBack = () => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/asset/`);
  };

  return isLoading ? (
    <Loading spinnerSize="large" minHeight="100vh" />
  ) : asset ? (
    <Wrapper>
      <PageHeader
        title={`${t("Asset")}/${asset?.fileName}`}
        onBack={handleBack}
        extra={<Button onClick={handleSave}>{t("Save")}</Button>}
      />
      <AssetBody
        asset={asset}
        selectedPreviewType={selectedPreviewType}
        handleTypeChange={handleTypeChange}
        isModalVisible={isModalVisible}
        handleModalCancel={handleModalCancel}
        handleFullScreen={handleFullScreen}
      />
      <CommentsSider comments={asset.thread?.comments} threadId={asset.threadId} />
    </Wrapper>
  ) : (
    <Wrapper>not found</Wrapper>
  );
};

const Wrapper = styled.div`
  margin: 16px;
  background-color: white;
  min-height: 100%;
`;

export default Asset;
