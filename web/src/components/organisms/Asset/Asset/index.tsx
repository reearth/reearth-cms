import { useNavigate, useParams } from "react-router-dom";

import Loading from "@reearth-cms/components/atoms/Loading";
import AssetWrapper from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/AssetWrapper";
import CommentsSider from "@reearth-cms/components/organisms/CommentsSider";

import useHooks from "./hooks";

const Asset: React.FC = () => {
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
  ) : (
    <AssetWrapper
      commentsSider={<CommentsSider comments={asset?.comments} threadId={asset?.threadId} />}
      asset={asset}
      selectedPreviewType={selectedPreviewType}
      handleTypeChange={handleTypeChange}
      isModalVisible={isModalVisible}
      handleModalCancel={handleModalCancel}
      handleFullScreen={handleFullScreen}
      onBack={handleBack}
      onSave={handleSave}
    />
  );
};

export default Asset;
