import ContentDetailsMolecule from "@reearth-cms/components/molecules/Content/Details";
import useAssetHooks from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentDetails: React.FC = () => {
  const t = useT();

  const {
    itemId,
    currentModel,
    currentItem,
    initialFormValues,
    itemCreationLoading,
    itemUpdatingLoading,
    collapsed,
    collapse,
    handleItemCreate,
    handleItemUpdate,
    handleNavigateToModel,
  } = useHooks();

  const {
    assetList,
    fileList,
    loading,
    uploading,
    uploadModalVisibility,
    uploadUrl,
    uploadType,
    handleUploadModalCancel,
    setUploadUrl,
    setUploadType,
    setFileList,
    setUploadModalVisibility,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleAssetsReload,
    handleSearchTerm,
  } = useAssetHooks();

  return (
    <ContentDetailsMolecule
      collapsed={collapsed}
      onCollapse={collapse}
      commentsPanel={
        currentItem ? (
          <CommentsPanel comments={currentItem?.comments} threadId={currentItem?.threadId} />
        ) : undefined
      }
      itemId={itemId}
      model={currentModel}
      initialFormValues={initialFormValues}
      loading={itemCreationLoading || itemUpdatingLoading}
      onItemCreate={handleItemCreate}
      onItemUpdate={handleItemUpdate}
      onBack={handleNavigateToModel}
      modelsMenu={
        <ModelsMenu
          collapsed={collapsed}
          title={t("Content")}
          onModelSelect={handleNavigateToModel}
        />
      }
      assetList={assetList}
      fileList={fileList}
      loadingAssets={loading}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
      uploadUrl={uploadUrl}
      uploadType={uploadType}
      onUploadModalCancel={handleUploadModalCancel}
      setUploadUrl={setUploadUrl}
      setUploadType={setUploadType}
      onAssetsCreate={handleAssetsCreate}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
      onAssetsReload={handleAssetsReload}
      onAssetSearchTerm={handleSearchTerm}
      setFileList={setFileList}
      setUploadModalVisibility={setUploadModalVisibility}
    />
  );
};

export default ContentDetails;
