import { useParams } from "react-router-dom";

import Loading from "@reearth-cms/components/atoms/Loading";
import AssetWrapper from "@reearth-cms/components/molecules/Asset/Asset/AssetBody";
import { ResourceTypes } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import useSettingsHooks from "@reearth-cms/components/organisms/Settings/General/hooks";

import useHooks from "./hooks";

const Asset: React.FC = () => {
  const { assetId } = useParams();
  const {
    asset,
    assetFileExt,
    isLoading,
    selectedPreviewType,
    isModalVisible,
    collapsed,
    viewerType,
    displayUnzipFileList,
    decompressing,
    isSaveDisabled,
    updateLoading,
    hasUpdateRight,
    handleAssetDecompress,
    handleAssetItemSelect,
    handleToggleCommentMenu,
    handleTypeChange,
    handleModalCancel,
    handleFullScreen,
    handleBack,
    handleSave,
    handleGetViewer,
  } = useHooks(assetId);

  const { workspaceSettings } = useSettingsHooks();

  return isLoading ? (
    <Loading spinnerSize="large" minHeight="100vh" />
  ) : (
    <AssetWrapper
      commentsPanel={
        <CommentsPanel
          resourceId={assetId ?? ""}
          resourceType={ResourceTypes.Asset}
          comments={asset?.comments}
          threadId={asset?.threadId}
          collapsed={collapsed}
          onCollapse={handleToggleCommentMenu}
          refetchQueries={["GetAssetItem"]}
        />
      }
      asset={asset}
      assetFileExt={assetFileExt}
      selectedPreviewType={selectedPreviewType}
      isModalVisible={isModalVisible}
      viewerType={viewerType}
      displayUnzipFileList={displayUnzipFileList}
      decompressing={decompressing}
      isSaveDisabled={isSaveDisabled}
      updateLoading={updateLoading}
      hasUpdateRight={hasUpdateRight}
      onAssetItemSelect={handleAssetItemSelect}
      onAssetDecompress={handleAssetDecompress}
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
