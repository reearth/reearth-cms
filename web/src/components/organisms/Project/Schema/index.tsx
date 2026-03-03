import { useCallback, useState } from "react";

import SchemaMolecule from "@reearth-cms/components/molecules/Schema";
import DeletionModal from "@reearth-cms/components/molecules/Schema/DeletionModal";
import FieldModal from "@reearth-cms/components/molecules/Schema/FieldModal";
import FieldCreationModalWithSteps from "@reearth-cms/components/molecules/Schema/FieldModal/FieldCreationModalWithSteps";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";
import { CreateFieldInput } from "@reearth-cms/components/molecules/Schema/types";
import useAssetHooks from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { ContentTypesEnum } from "@reearth-cms/gql/__generated__/graphql.generated";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ProjectSchema: React.FC = () => {
  const t = useT();
  const [currentImportSchemaModalPage, setCurrentImportSchemaModalPage] = useState(0);
  const assetHooks = useAssetHooks(false);
  const importHooks = useAssetHooks(true, [ContentTypesEnum.Geojson, ContentTypesEnum.Json]);
  const schemaHooks = useHooks();

  const toSchemaPreviewStep = useCallback(() => {
    setCurrentImportSchemaModalPage(1);
  }, []);

  const toImportingStep = useCallback(
    async (fields: CreateFieldInput[]) => {
      await schemaHooks.handleFieldsCreate(fields);
      setCurrentImportSchemaModalPage(2);
    },
    [schemaHooks],
  );

  const toFileSelectionStep = useCallback(() => {
    setCurrentImportSchemaModalPage(0);
  }, []);

  return (
    <>
      <SchemaMolecule
        alertList={importHooks.alertList}
        assetList={importHooks.assetList}
        collapsed={schemaHooks.collapsed}
        currentImportSchemaModalPage={currentImportSchemaModalPage}
        data={schemaHooks.data}
        dataChecking={importHooks.dataChecking}
        fieldsCreationError={schemaHooks.fieldsCreationError}
        fieldsCreationLoading={schemaHooks.fieldsCreationLoading}
        fileList={importHooks.fileList}
        hasCreateRight={schemaHooks.hasCreateRight}
        hasDeleteRight={schemaHooks.hasDeleteRight}
        hasUpdateRight={schemaHooks.hasUpdateRight}
        importFields={importHooks.importFields}
        importSchemaModalVisibility={importHooks.importSchemaModalVisibility}
        loading={importHooks.loading}
        modelsMenu={
          <ModelsMenu
            collapsed={schemaHooks.collapsed}
            displayGroups
            onGroupSelect={schemaHooks.handleGroupSelect}
            onModelSelect={schemaHooks.handleModelSelect}
            selectedSchemaType={schemaHooks.selectedSchemaType}
            title={t("Schema")}
            titleIcon="unorderedList"
          />
        }
        onAllFieldsDelete={schemaHooks.handleAllFieldDelete}
        onAssetCreateFromUrl={importHooks.handleAssetCreateFromUrl}
        onAssetsCreate={importHooks.handleAssetsCreate}
        onAssetSelect={importHooks.handleAssetSelect}
        onAssetsReload={importHooks.handleAssetsReload}
        onAssetTableChange={importHooks.handleAssetTableChange}
        onCollapse={schemaHooks.setCollapsed}
        onDeletionModalOpen={schemaHooks.handleDeletionModalOpen}
        onFieldCreationModalOpen={schemaHooks.handleFieldCreationModalOpen}
        onFieldDelete={schemaHooks.handleFieldDelete}
        onFieldReorder={schemaHooks.handleFieldOrder}
        onFieldUpdateModalOpen={schemaHooks.handleFieldUpdateModalOpen}
        onFileContentChange={async (file, fileList) => {
          const result = await importHooks.handleImportSchemaFileChange(file, fileList);

          if (result) toSchemaPreviewStep();
        }}
        onFileRemove={importHooks.handleImportSchemaFileRemove}
        onModalOpen={schemaHooks.handleModalOpen}
        onSchemaImportModalCancel={() => {
          importHooks.handleSchemaImportModalCancel();
          setCurrentImportSchemaModalPage(0);
        }}
        onSchemaImportModalOpen={importHooks.handleSchemaImportModalOpen}
        onSearchTerm={importHooks.handleSearchTerm}
        onSelectFileModalCancel={importHooks.handleSelectFileModalCancel}
        onSelectFileModalOpen={importHooks.handleSelectFileModalOpen}
        onUploadModalCancel={importHooks.handleUploadModalCancel}
        onUploadModalOpen={importHooks.handleUploadModalOpen}
        page={importHooks.page}
        pageSize={importHooks.pageSize}
        selectedAsset={importHooks.selectedAsset}
        selectedSchemaType={schemaHooks.selectedSchemaType}
        selectFileModalVisibility={importHooks.selectFileModalVisibility}
        setImportFields={importHooks.setImportFields}
        setIsMeta={schemaHooks.setIsMeta}
        setUploadType={importHooks.setUploadType}
        setUploadUrl={importHooks.setUploadUrl}
        toFileSelectionStep={toFileSelectionStep}
        toImportingStep={toImportingStep}
        toSchemaPreviewStep={toSchemaPreviewStep}
        totalCount={importHooks.totalCount}
        uploading={importHooks.uploading}
        uploadModalVisibility={importHooks.uploadModalVisibility}
        uploadType={importHooks.uploadType}
        uploadUrl={importHooks.uploadUrl}
      />
      <FormModal
        data={schemaHooks.data}
        isModel={schemaHooks.modelModalShown}
        onClose={schemaHooks.handleModalClose}
        onCreate={schemaHooks.handleSchemaCreate}
        onKeyCheck={schemaHooks.handleKeyCheck}
        onUpdate={schemaHooks.handleSchemaUpdate}
        open={schemaHooks.modelModalShown || schemaHooks.groupModalShown}
      />
      <DeletionModal
        data={schemaHooks.data}
        deleteLoading={schemaHooks.deleteModelLoading || schemaHooks.deleteGroupLoading}
        isModel={schemaHooks.modelDeletionModalShown}
        onClose={schemaHooks.handleDeletionModalClose}
        onDelete={schemaHooks.handleSchemaDelete}
        open={schemaHooks.modelDeletionModalShown || schemaHooks.groupDeletionModalShown}
      />
      {schemaHooks.selectedType === "Reference" && (
        <FieldCreationModalWithSteps
          handleCorrespondingFieldKeyUnique={schemaHooks.handleCorrespondingFieldKeyUnique}
          handleFieldKeyUnique={schemaHooks.handleFieldKeyUnique}
          handleReferencedModelGet={schemaHooks.handleReferencedModelGet}
          isLoading={schemaHooks.fieldUpdateLoading || schemaHooks.fieldCreationLoading}
          models={schemaHooks.models}
          onClose={schemaHooks.handleFieldModalClose}
          onSubmit={schemaHooks.handleFieldCreate}
          onUpdate={schemaHooks.handleFieldUpdate}
          open={schemaHooks.fieldModalShown}
          selectedField={schemaHooks.selectedField}
          selectedType={schemaHooks.selectedType}
        />
      )}
      {schemaHooks.selectedType && schemaHooks.selectedType !== "Reference" && (
        <FieldModal
          assetList={assetHooks.assetList}
          fieldLoading={
            schemaHooks.selectedField
              ? schemaHooks.fieldUpdateLoading
              : schemaHooks.fieldCreationLoading
          }
          fileList={assetHooks.fileList}
          groups={schemaHooks.groups}
          handleFieldKeyUnique={schemaHooks.handleFieldKeyUnique}
          isMeta={schemaHooks.isMeta}
          loadingAssets={assetHooks.loading}
          onAssetCreateFromUrl={assetHooks.handleAssetCreateFromUrl}
          onAssetsCreate={assetHooks.handleAssetsCreate}
          onAssetSearchTerm={assetHooks.handleSearchTerm}
          onAssetsGet={assetHooks.handleAssetsGet}
          onAssetsReload={assetHooks.handleAssetsReload}
          onAssetTableChange={assetHooks.handleAssetTableChange}
          onClose={schemaHooks.handleFieldModalClose}
          onGetAsset={assetHooks.handleGetAsset}
          onSubmit={
            schemaHooks.selectedField
              ? schemaHooks.handleFieldUpdate
              : schemaHooks.handleFieldCreate
          }
          onUploadModalCancel={assetHooks.handleUploadModalCancel}
          open={schemaHooks.fieldModalShown}
          page={assetHooks.page}
          pageSize={assetHooks.pageSize}
          selectedField={schemaHooks.selectedField}
          selectedSchemaType={schemaHooks.selectedSchemaType}
          selectedType={schemaHooks.selectedType}
          setFileList={assetHooks.setFileList}
          setUploadModalVisibility={assetHooks.setUploadModalVisibility}
          setUploadType={assetHooks.setUploadType}
          setUploadUrl={assetHooks.setUploadUrl}
          totalCount={assetHooks.totalCount}
          uploading={assetHooks.uploading}
          uploadModalVisibility={assetHooks.uploadModalVisibility}
          uploadType={assetHooks.uploadType}
          uploadUrl={assetHooks.uploadUrl}
        />
      )}
    </>
  );
};

export default ProjectSchema;
