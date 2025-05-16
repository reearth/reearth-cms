import { useParams } from "react-router-dom";

import Loading from "@reearth-cms/components/atoms/Loading";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import AssetWrapper from "@reearth-cms/components/molecules/Asset/Asset/AssetBody";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import useSettingsHooks from "@reearth-cms/components/organisms/Settings/General/hooks";

import useHooks from "./hooks";

const Asset: React.FC = () => {
  const { assetId } = useParams();
  const {
    asset,
    assetUrl,
    assetBlob,
    assetFileExt,
    isLoading,
    isDelayed,
    selectedPreviewType,
    isModalVisible,
    collapsed,
    viewerType,
    displayUnzipFileList,
    decompressing,
    isSaveDisabled,
    updateLoading,
    hasUpdateRight,
    setAssetUrl,
    handleAssetDecompress,
    handleAssetItemSelect,
    handleSingleAssetDownload,
    handleToggleCommentMenu,
    handleTypeChange,
    handleModalCancel,
    handleFullScreen,
    handleBack,
    handleSave,
    handleGetViewer,
  } = useHooks(assetId);

  const { workspaceSettings } = useSettingsHooks();

  if (!isDelayed || isLoading) {
    return <Loading spinnerSize="large" minHeight="100vh" />;
  }

  if (!asset) {
    return <NotFound />;
  }

  return (
    <AssetWrapper
      commentsPanel={
        <CommentsPanel
          resourceId={asset.id}
          resourceType={"ASSET"}
          comments={asset.comments}
          threadId={asset.threadId}
          collapsed={collapsed}
          onCollapse={handleToggleCommentMenu}
          refetchQueries={["GetAssetItem"]}
        />
      }
      asset={asset}
      assetUrl={assetUrl}
      assetBlob={assetBlob}
      assetFileExt={assetFileExt}
      selectedPreviewType={selectedPreviewType}
      isModalVisible={isModalVisible}
      viewerType={viewerType}
      displayUnzipFileList={displayUnzipFileList}
      decompressing={decompressing}
      isSaveDisabled={isSaveDisabled}
      updateLoading={updateLoading}
      hasUpdateRight={hasUpdateRight}
      setAssetUrl={setAssetUrl}
      onAssetItemSelect={handleAssetItemSelect}
      onAssetDecompress={handleAssetDecompress}
      onAssetDownload={handleSingleAssetDownload}
      onTypeChange={handleTypeChange}
      onModalCancel={handleModalCancel}
      onChangeToFullScreen={handleFullScreen}
      onBack={handleBack}
      onSave={handleSave}
      onGetViewer={handleGetViewer}
      workspaceSettings={workspaceSettings}
    />
  );
};

export default Asset;
