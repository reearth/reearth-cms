import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal, { useModal } from "@reearth-cms/components/atoms/Modal";
import Steps from "@reearth-cms/components/atoms/Step";
import {
  UploadProps,
  UploadFile,
  UploadFile as RawUploadFile,
} from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { defaultTypePropertyGet } from "@reearth-cms/components/organisms/Project/Schema/helpers";
import { Trans, useT } from "@reearth-cms/i18n";

import { fieldTypes } from "../fieldTypes";
import { CreateFieldInput, SchemaFieldType } from "../types";

import FileSelectionStep from "./FileSelectionStep";
import ImportingStep from "./ImportingStep";
import SchemaPreviewStep from "./SchemaPreviewStep";
import SelectFileModal from "./SelectFileModal";

type Props = {
  workspaceId?: string;
  projectId?: string;
  visible: boolean;
  selectFileModalVisibility: boolean;
  currentPage: number;
  assetList: Asset[];
  loading: boolean;
  guessSchemaFieldsLoading: boolean;
  fieldsCreationLoading: boolean;
  totalCount: number;
  selectedAsset?: ItemAsset;
  fileList: RawUploadFile[];
  uploadType: UploadType;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploading: boolean;
  uploadModalVisibility: boolean;
  page: number;
  pageSize: number;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onUploadModalOpen: () => void;
  onUploadModalCancel: () => void;
  toSchemaPreviewStep: () => void;
  toImportingStep: (fields: CreateFieldInput[]) => Promise<void>;
  fields: CreateFieldInput[];
  guessSchemaFieldsError?: boolean;
  fieldsCreationError?: boolean;
  setFields: Dispatch<SetStateAction<CreateFieldInput[]>>;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  onSearchTerm: (term?: string) => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onAssetSelect: (id: string) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onSelectFile: () => void;
  onSelectFileModalCancel: () => void;
  onModalClose: () => void;
};

const ImportSchemaModal: React.FC<Props> = ({
  workspaceId,
  projectId,
  visible,
  selectFileModalVisibility,
  currentPage,
  toSchemaPreviewStep,
  toImportingStep,
  assetList,
  loading,
  guessSchemaFieldsLoading,
  fieldsCreationLoading,
  totalCount,
  selectedAsset,
  fileList,
  uploadType,
  uploadUrl,
  uploading,
  fields,
  guessSchemaFieldsError,
  fieldsCreationError,
  setFields,
  setUploadUrl,
  setUploadType,
  setFileList,
  hasCreateRight,
  uploadModalVisibility,
  onUploadModalOpen,
  onUploadModalCancel,
  page,
  pageSize,
  onSearchTerm,
  onAssetsReload,
  onAssetTableChange,
  onAssetSelect,
  onAssetsCreate,
  onAssetCreateFromUrl,
  hasUpdateRight,
  hasDeleteRight,
  onSelectFile,
  onSelectFileModalCancel,
  onModalClose,
}) => {
  const t = useT();
  const { confirm } = useModal();

  const handleFieldReorder = useCallback(
    (list: CreateFieldInput[], startIndex: number, endIndex: number) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    },
    [],
  );

  const handleDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0) return;
      setFields(prev => handleFieldReorder(prev, fromIndex, toIndex));
    },
    [handleFieldReorder, setFields],
  );

  const handleFieldDelete = useCallback(
    (key: string) => {
      setFields(prev => prev.filter(item => item.key !== key));
    },
    [setFields],
  );

  const handleFieldTypeChange = useCallback(
    (key: string, value: SchemaFieldType) => {
      setFields(prev =>
        prev.map(field =>
          field.key === key
            ? { ...field, type: value, typeProperty: defaultTypePropertyGet(value) }
            : field,
        ),
      );
    },
    [setFields],
  );

  const confirmFieldDeletion = useCallback(
    (fieldId: string, name: string) => {
      confirm({
        content: <Trans i18nKey="Are you sure you want to delete this field?" values={{ name }} />,
        maskClosable: true,
        onOk() {
          handleFieldDelete(fieldId);
        },
      });
    },
    [confirm, handleFieldDelete],
  );

  const fieldTypeOptions = useMemo(() => {
    return Object.entries(fieldTypes).map(([key, value]) => ({
      value: key,
      label: (
        <FieldTypeLabel>
          <Icon icon={value.icon} color={value.color} />
          <span>{value.title}</span>
        </FieldTypeLabel>
      ),
    }));
  }, []);

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    directory: false,
    showUploadList: true,
    accept: ".geojson,.json",
    listType: "picture",
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: file => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const handleAssetUpload = useCallback(async () => {
    let result;
    if (uploadType === "url" && uploadUrl) {
      result = await onAssetCreateFromUrl?.(uploadUrl.url, uploadUrl.autoUnzip);
    } else if (fileList && fileList.length > 0) {
      const assets = await onAssetsCreate?.(fileList);
      result = assets?.[0];
    }
    onUploadModalCancel();
    return result ?? undefined;
  }, [uploadType, uploadUrl, fileList, onAssetCreateFromUrl, onAssetsCreate, onUploadModalCancel]);

  const handleUploadAndLink = useCallback(async () => {
    const asset = await handleAssetUpload();
    if (asset) onAssetSelect(asset.id);
    onUploadModalCancel();
  }, [handleAssetUpload, onUploadModalCancel, onAssetSelect]);

  const stepComponents = [
    {
      title: "Select file",
      content: (
        <FileSelectionStep
          selectedAsset={selectedAsset}
          onSelectFile={onSelectFile}
          workspaceId={workspaceId}
          projectId={projectId}
        />
      ),
    },
    {
      title: "Schema preview",
      content: (
        <SchemaPreviewStep
          fields={fields}
          fieldTypeOptions={fieldTypeOptions}
          onDragEnd={handleDragEnd}
          onFieldTypeChange={handleFieldTypeChange}
          onFieldDelete={confirmFieldDeletion}
          hasUpdateRight={hasUpdateRight}
          hasDeleteRight={hasDeleteRight}
        />
      ),
    },
    {
      title: "Importing",
      content: (
        <ImportingStep
          fieldsCreationLoading={fieldsCreationLoading}
          fieldsCreationError={fieldsCreationError}
          onModalClose={onModalClose}
        />
      ),
    },
  ];

  const items = stepComponents.map(item => ({ key: item.title, title: item.title }));

  return (
    <StyledModal
      title={t("Import Schema")}
      centered
      open={visible}
      onCancel={onModalClose}
      width="70vw"
      footer={
        <>
          {currentPage === 0 && (
            <Button
              type="primary"
              disabled={!selectedAsset || guessSchemaFieldsError}
              onClick={toSchemaPreviewStep}>
              {t("Next")}
            </Button>
          )}
          {currentPage === 1 && (
            <Button
              type="primary"
              loading={guessSchemaFieldsLoading}
              disabled={fields.length === 0}
              onClick={() => toImportingStep(fields)}>
              {t("Import Schema")}
            </Button>
          )}
        </>
      }
      styles={{
        body: {
          height: "70vh",
        },
      }}>
      <>
        <HiddenSteps current={currentPage} items={items} />
        <StepsContent>{stepComponents[currentPage].content}</StepsContent>
        <SelectFileModal
          visible={selectFileModalVisibility}
          onModalClose={onSelectFileModalCancel}
          linkedAsset={selectedAsset}
          assetList={assetList}
          loading={loading}
          uploadProps={uploadProps}
          uploading={uploading}
          fileList={fileList}
          uploadUrl={uploadUrl}
          uploadType={uploadType}
          setUploadUrl={setUploadUrl}
          setUploadType={setUploadType}
          onUploadModalOpen={onUploadModalOpen}
          hasCreateRight={hasCreateRight}
          uploadModalVisibility={uploadModalVisibility}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onAssetSelect={onAssetSelect}
          onSearchTerm={onSearchTerm}
          onAssetsReload={onAssetsReload}
          onAssetTableChange={onAssetTableChange}
          onUploadModalCancel={onUploadModalCancel}
          onUploadAndLink={handleUploadAndLink}
        />
      </>
    </StyledModal>
  );
};

export default ImportSchemaModal;

const StyledModal = styled(Modal)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;

const HiddenSteps = styled(Steps)`
  display: none;
`;

const StepsContent = styled.div`
  height: 100%;
`;

const FieldTypeLabel = styled.div`
  width: 100%;
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 8px;
`;
