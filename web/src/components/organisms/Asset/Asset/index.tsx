import { useNavigate, useParams } from "react-router-dom";

import Loading from "@reearth-cms/components/atoms/Loading";
import AssetWrapper from "@reearth-cms/components/molecules/Asset/Asset/AssetBody";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";

import useHooks from "./hooks";

const Asset: React.FC = () => {
  const navigate = useNavigate();
  const { workspaceId, projectId, assetId } = useParams();
  const {
    asset,
    isLoading,
    selectedPreviewType,
    isModalVisible,
    collapsed,
    handleToggleCommentMenu,
    handleAssetUpdate,
    handleTypeChange,
    handleModalCancel,
    handleFullScreen,
  } = useHooks(assetId);

  const handleSave = async () => {
    if (assetId) {
      await handleAssetUpdate(assetId, selectedPreviewType);
      handleBack();
    }
  };

  const handleBack = () => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/asset/`);
  };

  return isLoading ? (
    <Loading spinnerSize="large" minHeight="100vh" />
  ) : (
    <AssetWrapper
      commentsPanel={
        <CommentsPanel
          comments={asset?.comments}
          threadId={asset?.threadId}
          collapsed={collapsed}
          onCollapse={handleToggleCommentMenu}
        />
      }
      asset={asset}
      selectedPreviewType={selectedPreviewType}
      isModalVisible={isModalVisible}
      onTypeChange={handleTypeChange}
      onModalCancel={handleModalCancel}
      onChangeToFullScreen={handleFullScreen}
      onBack={handleBack}
      onSave={handleSave}
    />
  );
};

export default Asset;
