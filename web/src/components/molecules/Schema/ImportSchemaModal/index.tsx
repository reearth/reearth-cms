import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";

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
import { Trans, useT } from "@reearth-cms/i18n";

import { fieldTypes } from "../fieldTypes";
import { Field, FieldType } from "../types";

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
  totalCount: number;
  selectedAsset?: ItemAsset;
  fileList: RawUploadFile[];
  progress: number;
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
  toSchemaPreviewStep: () => void;
  toImportingStep: () => void;
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
  totalCount,
  selectedAsset,
  fileList,
  progress,
  uploadType,
  uploadUrl,
  uploading,
  setUploadUrl,
  setUploadType,
  setFileList,
  hasCreateRight,
  uploadModalVisibility,
  displayUploadModal,
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

  const initialFields: Field[] = [
    {
      id: "01jkde813j9ffyghqs5ewq2mwz",
      type: "Text",
      title: "Name",
      key: "name",
      description: "",
      required: false,
      unique: false,
      isTitle: false,
      multiple: false,
      typeProperty: {
        defaultValue: null,
      },
    },
    {
      id: "01jppw7ctmv1ny91z49h2rfcdc",
      type: "Integer",
      title: "Age",
      key: "age",
      description: "",
      required: false,
      unique: false,
      isTitle: false,
      multiple: false,
      typeProperty: {
        integerDefaultValue: null,
      },
    },
  ];

  const [fields, setFields] = useState<Field[]>(initialFields);

  const handleFieldReorder = useCallback((list: Field[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }, []);

  const handleDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0) return;
      setFields(prev => handleFieldReorder(prev, fromIndex, toIndex));
    },
    [handleFieldReorder],
  );

  const handleFieldDelete = useCallback((id: string) => {
    setFields(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleFieldTypeChange = useCallback((id: string, value: FieldType) => {
    setFields(prev => prev.map(field => (field.id === id ? { ...field, type: value } : field)));
  }, []);

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
    accept: "*",
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
  }, [handleAssetUpload, onAssetSelect]);

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
      content: <ImportingStep progress={progress} />,
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
            <Button type="primary" disabled={!selectedAsset} onClick={toSchemaPreviewStep}>
              {t("Next")}
            </Button>
          )}
          {currentPage === 1 && (
            <Button type="primary" onClick={toImportingStep}>
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
  gap: 8px;
`;
