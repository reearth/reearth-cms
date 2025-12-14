import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";

import { AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import Steps from "@reearth-cms/components/atoms/Step";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import {
  UploadProps,
  UploadFile,
  UploadFile as RawUploadFile,
} from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { defaultTypePropertyGet } from "@reearth-cms/components/organisms/Project/Schema/helpers";
import { useT } from "@reearth-cms/i18n";
import { FileUtils } from "@reearth-cms/utils/file";
import { ObjectUtils } from "@reearth-cms/utils/object";

import { fieldTypes } from "../fieldTypes";
import { CreateFieldInput, ImportFieldInput, SchemaFieldType } from "../types";

import FileSelectionStep from "./FileSelectionStep";
import ImportingStep from "./ImportingStep";
import SchemaPreviewStep from "./SchemaPreviewStep";
import SelectFileModal from "./SelectFileModal";
import Flex from "@reearth-cms/components/atoms/Flex";

type Props = {
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
  alertList?: AlertProps[];
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
  toFileSelectionStep: () => void;
  fields: ImportFieldInput[];
  guessSchemaFieldsError?: boolean;
  fieldsCreationError?: boolean;
  setFields: Dispatch<SetStateAction<ImportFieldInput[]>>;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setAlertList: (alertList: AlertProps[]) => void;
  onSearchTerm: (term?: string) => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onAssetSelect: (id: string) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onSelectFile: () => void;
  onSelectFileModalCancel: () => void;
  onModalClose: () => void;
  dataChecking: boolean;
  onFileContentChange: (fileContent: string) => void;
};

const ImportSchemaModal: React.FC<Props> = ({
  visible,
  selectFileModalVisibility,
  currentPage,
  toSchemaPreviewStep,
  toImportingStep,
  toFileSelectionStep,
  assetList,
  loading,
  guessSchemaFieldsLoading,
  fieldsCreationLoading,
  totalCount,
  selectedAsset,
  fileList,
  alertList,
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
  setAlertList,
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
  dataChecking,
  onFileContentChange,
}) => {
  const t = useT();

  const hasImportFields = useMemo(() => fields.some(field => !field.hidden), [fields]);

  const handleFieldReorder = useCallback(
    (list: ImportFieldInput[], startIndex: number, endIndex: number) => {
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

  const handleToggleFieldHide = useCallback(
    (key: string) => {
      setFields(prev =>
        prev.map(item => (item.key === key ? { ...item, hidden: !item.hidden } : item)),
      );
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
          fileList={fileList}
          setFileList={setFileList}
          alertList={alertList}
          setAlertList={setAlertList}
          onFileContentChange={onFileContentChange}
          dataChecking={dataChecking}
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
          onToggleFieldHide={handleToggleFieldHide}
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
      maskClosable={false}
      width="70vw"
      footer={
        <>
          {currentPage === 1 && (
            <Flex justify="space-between">
              <Button
                type="default"
                onClick={() => {
                  toFileSelectionStep();
                }}>
                {t("Back")}
              </Button>
              <Tooltip
                title={
                  hasImportFields
                    ? undefined
                    : t("Schema must contain at least one field to import")
                }>
                <Button
                  type="primary"
                  loading={guessSchemaFieldsLoading}
                  disabled={!hasImportFields}
                  onClick={() => {
                    return toImportingStep(
                      fields.filter(field => {
                        const shouldImport = !field.hidden;
                        delete field.hidden;
                        return shouldImport;
                      }),
                    );
                  }}>
                  {t("Import Schema")}
                </Button>
              </Tooltip>
            </Flex>
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
