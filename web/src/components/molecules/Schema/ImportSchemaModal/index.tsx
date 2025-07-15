import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
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
import { CreateFieldInput, FieldType } from "../types";

import FileSelectionStep from "./FileSelectionStep";
import ImportingStep from "./ImportingStep";
import SchemaPreviewStep from "./SchemaPreviewStep";
import SelectFileModal from "./SelectFileModal";

type Props = {
  workspaceId?: string;
  projectId?: string;
  visible: boolean;
  selectFileModalVisible: boolean;
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
  displayUploadModal: () => void;
  hideUploadModal: () => void;
  toSchemaPreviewStep: () => void;
  toImportingStep: (fields: CreateFieldInput[]) => Promise<void>;
  fields: CreateFieldInput[];
  hasImportSchemaFieldsError?: boolean;
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
  onUploadModalCancel: () => void;
  onSelectFile: () => void;
  onSelectSchemaFileModalClose: () => void;
  onModalClose: () => void;
};

const ImportSchemaModal: React.FC<Props> = ({
  workspaceId,
  projectId,
  visible,
  selectFileModalVisible,
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
  hasImportSchemaFieldsError,
  setFields,
  setUploadUrl,
  setUploadType,
  setFileList,
  hasCreateRight,
  uploadModalVisibility,
  displayUploadModal,
  hideUploadModal,
  page,
  pageSize,
  onSearchTerm,
  onAssetsReload,
  onAssetTableChange,
  onAssetSelect,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onUploadModalCancel,
  hasUpdateRight,
  hasDeleteRight,
  onSelectFile,
  onSelectSchemaFileModalClose,
  onModalClose,
}) => {
  const t = useT();

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
    (key: string, value: FieldType) => {
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
      Modal.confirm({
        content: <Trans i18nKey="Are you sure you want to delete this field?" values={{ name }} />,
        icon: <Icon icon="exclamationCircle" />,
        cancelText: t("Cancel"),
        maskClosable: true,
        onOk() {
          handleFieldDelete(fieldId);
        },
      });
    },
    [handleFieldDelete, t],
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
    if (uploadType === "url" && uploadUrl) {
      return (await onAssetCreateFromUrl?.(uploadUrl.url, uploadUrl.autoUnzip)) ?? undefined;
    } else if (fileList) {
      const assets = await onAssetsCreate?.(fileList);
      return assets && assets?.length > 0 ? assets[0] : undefined;
    }
  }, [fileList, onAssetCreateFromUrl, onAssetsCreate, uploadType, uploadUrl]);

  const handleUploadAndLink = useCallback(async () => {
    const asset = await handleAssetUpload();
    if (asset) onAssetSelect(asset.id);
    hideUploadModal();
  }, [handleAssetUpload, hideUploadModal, onAssetSelect]);

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
      content: <ImportingStep fieldsCreationLoading={fieldsCreationLoading} />,
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
              disabled={!selectedAsset || hasImportSchemaFieldsError}
              onClick={toSchemaPreviewStep}>
              {t("Next")}
            </Button>
          )}
          {currentPage === 1 && (
            <Button
              type="primary"
              loading={guessSchemaFieldsLoading}
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
          visible={selectFileModalVisible}
          onModalClose={onSelectSchemaFileModalClose}
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
          displayUploadModal={displayUploadModal}
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
