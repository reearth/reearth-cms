import { useCallback, useState } from "react";

import SchemaMolecule from "@reearth-cms/components/molecules/Schema";
import DeletionModal from "@reearth-cms/components/molecules/Schema/DeletionModal";
import FieldModal from "@reearth-cms/components/molecules/Schema/FieldModal";
import FieldCreationModalWithSteps from "@reearth-cms/components/molecules/Schema/FieldModal/FieldCreationModalWithSteps";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";
import { CreateFieldInput } from "@reearth-cms/components/molecules/Schema/types";
import useAssetHooks from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { ContentTypesEnum } from "@reearth-cms/gql/graphql-client-api";
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
      console.log("fields", fields);
      await schemaHooks.handleFieldsCreate(fields);
      // await new Promise(resolve => {
      //   setTimeout(resolve, 3000);
      // });
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
        data={schemaHooks.data}
        collapsed={schemaHooks.collapsed}
        selectedSchemaType={schemaHooks.selectedSchemaType}
        // workspaceId={schemaHooks.workspaceId}
        // projectId={schemaHooks.projectId}
        page={importHooks.page}
        pageSize={importHooks.pageSize}
        assetList={importHooks.assetList}
        alertList={importHooks.alertList}
        loading={importHooks.loading}
        guessSchemaFieldsLoading={importHooks.guessSchemaFieldsLoading}
        selectedAsset={importHooks.selectedAsset}
        fileList={importHooks.fileList}
        uploadType={importHooks.uploadType}
        uploadUrl={importHooks.uploadUrl}
        uploading={importHooks.uploading}
        importFields={importHooks.importFields}
        guessSchemaFieldsError={importHooks.guessSchemaFieldsError}
        fieldsCreationError={schemaHooks.fieldsCreationError}
        setImportFields={importHooks.setImportFields}
        setUploadUrl={importHooks.setUploadUrl}
        setUploadType={importHooks.setUploadType}
        setFileList={importHooks.setFileList}
        setAlertList={importHooks.setAlertList}
        uploadModalVisibility={importHooks.uploadModalVisibility}
        totalCount={importHooks.totalCount}
        hasCreateRight={schemaHooks.hasCreateRight}
        hasUpdateRight={schemaHooks.hasUpdateRight}
        hasDeleteRight={schemaHooks.hasDeleteRight}
        onSearchTerm={importHooks.handleSearchTerm}
        onAssetsReload={importHooks.handleAssetsReload}
        onAssetTableChange={importHooks.handleAssetTableChange}
        onAssetSelect={importHooks.handleAssetSelect}
        onAssetsCreate={importHooks.handleAssetsCreate}
        onAssetCreateFromUrl={importHooks.handleAssetCreateFromUrl}
        onModalOpen={schemaHooks.handleModalOpen}
        onDeletionModalOpen={schemaHooks.handleDeletionModalOpen}
        importSchemaModalVisibility={importHooks.importSchemaModalVisibility}
        selectFileModalVisibility={importHooks.selectFileModalVisibility}
        onSchemaImportModalOpen={importHooks.handleSchemaImportModalOpen}
        onSchemaImportModalCancel={() => {
          importHooks.handleSchemaImportModalCancel();
          setCurrentImportSchemaModalPage(0);
        }}
        onSelectFileModalOpen={importHooks.handleSelectFileModalOpen}
        onSelectFileModalCancel={importHooks.handleSelectFileModalCancel}
        onUploadModalOpen={importHooks.handleUploadModalOpen}
        onUploadModalCancel={importHooks.handleUploadModalCancel}
        currentImportSchemaModalPage={currentImportSchemaModalPage}
        toSchemaPreviewStep={toSchemaPreviewStep}
        toImportingStep={toImportingStep}
        toFileSelectionStep={toFileSelectionStep}
        modelsMenu={
          <ModelsMenu
            title={t("Schema")}
            collapsed={schemaHooks.collapsed}
            selectedSchemaType={schemaHooks.selectedSchemaType}
            displayGroups
            titleIcon="unorderedList"
            onModelSelect={schemaHooks.handleModelSelect}
            onGroupSelect={schemaHooks.handleGroupSelect}
          />
        }
        setIsMeta={schemaHooks.setIsMeta}
        onCollapse={schemaHooks.setCollapsed}
        onFieldCreationModalOpen={schemaHooks.handleFieldCreationModalOpen}
        onFieldUpdateModalOpen={schemaHooks.handleFieldUpdateModalOpen}
        onFieldReorder={schemaHooks.handleFieldOrder}
        onFieldDelete={schemaHooks.handleFieldDelete}
        onAllFieldsDelete={schemaHooks.handleAllFieldDelete}
        fieldsCreationLoading={schemaHooks.fieldsCreationLoading}
        dataChecking={importHooks.dataChecking}
        onFileContentChange={async fileContent => {
          await importHooks.handleImportSchemaFileChange(fileContent);
          toSchemaPreviewStep();
        }}
      />
      <FormModal
        data={schemaHooks.data}
        open={schemaHooks.modelModalShown || schemaHooks.groupModalShown}
        onKeyCheck={schemaHooks.handleKeyCheck}
        onClose={schemaHooks.handleModalClose}
        onCreate={schemaHooks.handleSchemaCreate}
        onUpdate={schemaHooks.handleSchemaUpdate}
        isModel={schemaHooks.modelModalShown}
      />
      <DeletionModal
        data={schemaHooks.data}
        open={schemaHooks.modelDeletionModalShown || schemaHooks.groupDeletionModalShown}
        deleteLoading={schemaHooks.deleteModelLoading || schemaHooks.deleteGroupLoading}
        onDelete={schemaHooks.handleSchemaDelete}
        onClose={schemaHooks.handleDeletionModalClose}
        isModel={schemaHooks.modelDeletionModalShown}
      />
      {schemaHooks.selectedType === "Reference" && (
        <FieldCreationModalWithSteps
          models={schemaHooks.models}
          selectedType={schemaHooks.selectedType}
          selectedField={schemaHooks.selectedField}
          open={schemaHooks.fieldModalShown}
          isLoading={schemaHooks.fieldUpdateLoading || schemaHooks.fieldCreationLoading}
          handleReferencedModelGet={schemaHooks.handleReferencedModelGet}
          handleCorrespondingFieldKeyUnique={schemaHooks.handleCorrespondingFieldKeyUnique}
          handleFieldKeyUnique={schemaHooks.handleFieldKeyUnique}
          onClose={schemaHooks.handleFieldModalClose}
          onSubmit={schemaHooks.handleFieldCreate}
          onUpdate={schemaHooks.handleFieldUpdate}
        />
      )}
      {schemaHooks.selectedType && schemaHooks.selectedType !== "Reference" && (
        <FieldModal
          groups={schemaHooks.groups}
          selectedType={schemaHooks.selectedType}
          selectedSchemaType={schemaHooks.selectedSchemaType}
          isMeta={schemaHooks.isMeta}
          open={schemaHooks.fieldModalShown}
          selectedField={schemaHooks.selectedField}
          fieldLoading={
            schemaHooks.selectedField
              ? schemaHooks.fieldUpdateLoading
              : schemaHooks.fieldCreationLoading
          }
          handleFieldKeyUnique={schemaHooks.handleFieldKeyUnique}
          onClose={schemaHooks.handleFieldModalClose}
          onSubmit={
            schemaHooks.selectedField
              ? schemaHooks.handleFieldUpdate
              : schemaHooks.handleFieldCreate
          }
          onAssetTableChange={assetHooks.handleAssetTableChange}
          totalCount={assetHooks.totalCount}
          page={assetHooks.page}
          pageSize={assetHooks.pageSize}
          assetList={assetHooks.assetList}
          fileList={assetHooks.fileList}
          loadingAssets={assetHooks.loading}
          uploading={assetHooks.uploading}
          uploadModalVisibility={assetHooks.uploadModalVisibility}
          uploadUrl={assetHooks.uploadUrl}
          uploadType={assetHooks.uploadType}
          onUploadModalCancel={assetHooks.handleUploadModalCancel}
          setUploadUrl={assetHooks.setUploadUrl}
          setUploadType={assetHooks.setUploadType}
          onAssetsCreate={assetHooks.handleAssetsCreate}
          onAssetCreateFromUrl={assetHooks.handleAssetCreateFromUrl}
          onAssetSearchTerm={assetHooks.handleSearchTerm}
          onAssetsGet={assetHooks.handleAssetsGet}
          onAssetsReload={assetHooks.handleAssetsReload}
          setFileList={assetHooks.setFileList}
          setUploadModalVisibility={assetHooks.setUploadModalVisibility}
          onGetAsset={assetHooks.handleGetAsset}
        />
      )}
    </>
  );
};

export default ProjectSchema;
