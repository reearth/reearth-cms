import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";

import { AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Flex from "@reearth-cms/components/atoms/Flex";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import Steps from "@reearth-cms/components/atoms/Step";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import {
  UploadFile as RawUploadFile,
  UploadFile,
  UploadProps,
} from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { fieldTypes } from "../fieldTypes";
import { CreateFieldInput, ImportFieldInput } from "../types";
import FileSelectionStep from "./FileSelectionStep";
import ImportingStep from "./ImportingStep";
import SchemaPreviewStep from "./SchemaPreviewStep";

type Props = {
  alertList?: AlertProps[];
  assetList: Asset[];
  currentPage: number;
  dataChecking: boolean;
  fields: ImportFieldInput[];
  fieldsCreationError?: boolean;
  fieldsCreationLoading: boolean;
  fileList: RawUploadFile[];
  hasCreateRight: boolean;
  hasDeleteRight: boolean;
  hasUpdateRight: boolean;
  loading: boolean;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetSelect: (id: string) => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onFileContentChange: UploadProps["beforeUpload"];
  onFileRemove: UploadProps["onRemove"];
  onModalClose: () => void;
  onSearchTerm: (term?: string) => void;
  onSelectFile: () => void;
  onSelectFileModalCancel: () => void;
  onUploadModalCancel: () => void;
  onUploadModalOpen: () => void;
  page: number;
  pageSize: number;
  selectedAsset?: ItemAsset;
  selectFileModalVisibility: boolean;
  setFields: Dispatch<SetStateAction<ImportFieldInput[]>>;
  setUploadType: (type: UploadType) => void;
  setUploadUrl: (uploadUrl: { autoUnzip: boolean; url: string }) => void;
  toFileSelectionStep: () => void;
  toImportingStep: (fields: CreateFieldInput[]) => Promise<void>;
  toSchemaPreviewStep: () => void;
  totalCount: number;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadType: UploadType;
  uploadUrl: { autoUnzip: boolean; url: string };
  visible: boolean;
};

const ImportSchemaModal: React.FC<Props> = ({
  alertList,
  currentPage,
  dataChecking,
  fields,
  fieldsCreationError,
  fieldsCreationLoading,
  fileList,
  hasDeleteRight,
  hasUpdateRight,
  onFileContentChange,
  onFileRemove,
  onModalClose,
  setFields,
  toFileSelectionStep,
  toImportingStep,
  visible,
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

  const handleToggleAllFieldHide = useCallback(() => {
    setFields(prev => {
      const checkedCount = prev.filter(item => !item.hidden).length;
      const isIndeterminate = checkedCount >= 0 && checkedCount < prev.length;
      return prev.map(item => ({ ...item, hidden: !isIndeterminate }));
    });
  }, [setFields]);

  const fieldTypeOptions = useMemo(() => {
    return Object.entries(fieldTypes).map(([key, value]) => ({
      label: (
        <FieldTypeLabel>
          <Icon color={value.color} icon={value.icon} />
          <span>{value.title}</span>
        </FieldTypeLabel>
      ),
      value: key,
    }));
  }, []);

  const stepComponents = [
    {
      content: (
        <FileSelectionStep
          alertList={alertList}
          dataChecking={dataChecking}
          fileList={fileList}
          onFileContentChange={onFileContentChange}
          onFileRemove={onFileRemove}
        />
      ),
      title: "Select file",
    },
    {
      content: (
        <SchemaPreviewStep
          fields={fields}
          fieldTypeOptions={fieldTypeOptions}
          hasDeleteRight={hasDeleteRight}
          hasUpdateRight={hasUpdateRight}
          onDragEnd={handleDragEnd}
          onToggleAllFieldsHide={handleToggleAllFieldHide}
          onToggleFieldHide={handleToggleFieldHide}
        />
      ),
      title: "Schema preview",
    },
    {
      content: (
        <ImportingStep
          fieldsCreationError={fieldsCreationError}
          fieldsCreationLoading={fieldsCreationLoading}
          onModalClose={onModalClose}
        />
      ),
      title: "Importing",
    },
  ];

  const items = stepComponents.map(item => ({ key: item.title, title: item.title }));

  return (
    <StyledModal
      centered
      footer={
        <>
          {currentPage === 1 && (
            <Flex justify="space-between">
              <Button
                onClick={() => {
                  toFileSelectionStep();
                }}
                type="default">
                {t("Back")}
              </Button>
              <Tooltip
                title={
                  hasImportFields
                    ? undefined
                    : t("Schema must contain at least one field to import")
                }>
                <Button
                  data-testid={DATA_TEST_ID.ImportSchemaModal__ImportButton}
                  disabled={!hasImportFields}
                  onClick={() => {
                    return toImportingStep(
                      fields.filter(field => {
                        const shouldImport = !field.hidden;
                        delete field.hidden;
                        return shouldImport;
                      }),
                    );
                  }}
                  type="primary">
                  {t("Import")}
                </Button>
              </Tooltip>
            </Flex>
          )}
        </>
      }
      maskClosable={false}
      onCancel={onModalClose}
      open={visible}
      styles={{
        body: {
          height: "70vh",
        },
      }}
      title={t("Import Schema")}
      width="70vw">
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
  font-weight: 400;
`;
