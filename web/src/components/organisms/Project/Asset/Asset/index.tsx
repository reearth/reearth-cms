import Loading from "@reearth-cms/components/atoms/Loading";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import AssetWrapper from "@reearth-cms/components/molecules/Asset/Asset/AssetBody";
import useCommentHooks from "@reearth-cms/components/organisms/Common/CommentsPanel/hooks";
import useSettingsHooks from "@reearth-cms/components/organisms/Settings/General/hooks";

import useHooks from "./hooks";

const Asset: React.FC = () => {
  const {
    userId,
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
  } = useHooks();

  const { workspaceSettings } = useSettingsHooks();

  const { handleCommentCreate, handleCommentUpdate, handleCommentDelete, ...commentProps } =
    useCommentHooks({
      resourceType: "ASSET",
      refetchQueries: ["GetAssetItem"],
    });

  return isLoading ? (
    <Loading spinnerSize="large" minHeight="100vh" />
  ) : asset ? (
    <AssetWrapper
      userId={userId}
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
      collapsed={collapsed}
      onCollapse={handleToggleCommentMenu}
      commentProps={{
        onCommentCreate: handleCommentCreate,
        onCommentUpdate: handleCommentUpdate,
        onCommentDelete: handleCommentDelete,
        ...commentProps,
      }}
    />
  ) : (
    <NotFound />
  );
};

export default Asset;
