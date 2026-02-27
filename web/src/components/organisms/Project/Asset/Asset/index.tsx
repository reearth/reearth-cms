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
    assetFileExt,
    collapsed,
    decompressing,
    displayUnzipFileList,
    handleAssetDecompress,
    handleAssetItemSelect,
    handleBack,
    handleFullScreen,
    handleModalCancel,
    handleSave,
    handleSingleAssetDownload,
    handleToggleCommentMenu,
    handleTypeChange,
    hasUpdateRight,
    isLoading,
    isModalVisible,
    isSaveDisabled,
    selectedPreviewType,
    updateLoading,
    viewerRef,
    viewerType,
  } = useHooks(assetId);

  const { workspaceSettings } = useSettingsHooks();

  if (isLoading) {
    return <Loading minHeight="100vh" spinnerSize="large" />;
  }

  if (!asset) {
    return <NotFound />;
  }

  return (
    <AssetWrapper
      asset={asset}
      assetFileExt={assetFileExt}
      commentsPanel={
        <CommentsPanel
          collapsed={collapsed}
          comments={asset.comments}
          onCollapse={handleToggleCommentMenu}
          refetchQueries={["GetAssetItem"]}
          resourceId={asset.id}
          resourceType={"ASSET"}
          threadId={asset.threadId}
        />
      }
      decompressing={decompressing}
      displayUnzipFileList={displayUnzipFileList}
      hasUpdateRight={hasUpdateRight}
      isModalVisible={isModalVisible}
      isSaveDisabled={isSaveDisabled}
      onAssetDecompress={handleAssetDecompress}
      onAssetDownload={handleSingleAssetDownload}
      onAssetItemSelect={handleAssetItemSelect}
      onBack={handleBack}
      onChangeToFullScreen={handleFullScreen}
      onModalCancel={handleModalCancel}
      onSave={handleSave}
      onTypeChange={handleTypeChange}
      selectedPreviewType={selectedPreviewType}
      updateLoading={updateLoading}
      viewerRef={viewerRef}
      viewerType={viewerType}
      workspaceSettings={workspaceSettings}
    />
  );
};

export default Asset;
