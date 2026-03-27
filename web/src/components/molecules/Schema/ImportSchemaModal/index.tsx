import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";

import { AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Flex from "@reearth-cms/components/atoms/Flex";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import Steps from "@reearth-cms/components/atoms/Step";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { UploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { ErrorLogMeta, ImportErrorLogUtils } from "@reearth-cms/utils/importErrorLog";
import { AntdToken, CustomToken } from "@reearth-cms/utils/style";

import { fieldTypes } from "../fieldTypes";
import { CreateFieldInput, ImportFieldInput } from "../types";

import FileSelectionStep from "./FileSelectionStep";
import ImportingStep from "./ImportingStep";
import SchemaErrorLogStep from "./SchemaErrorLogStep";
import SchemaPreviewStep from "./SchemaPreviewStep";

type Props = {
  visible: boolean;
  selectFileModalVisibility: boolean;
  currentPage: number;
  assetList: Asset[];
  loading: boolean;
  fieldsCreationLoading: boolean;
  totalCount: number;
  selectedAsset?: ItemAsset;
  fileList: UploadFile[];
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
  fieldsCreationError?: boolean;
  setFields: Dispatch<SetStateAction<ImportFieldInput[]>>;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onSearchTerm: (term?: string) => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onAssetSelect: (id: string) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onSelectFile: () => void;
  onSelectFileModalCancel: () => void;
  onModalClose: () => void;
  schemaErrorLogMeta: ErrorLogMeta | null;
  dataChecking: boolean;
  onFileContentChange: UploadProps["beforeUpload"];
  onFileRemove: UploadProps["onRemove"];
};

const ImportSchemaModal: React.FC<Props> = ({
  visible,
  currentPage,
  toImportingStep,
  toFileSelectionStep,
  fieldsCreationLoading,
  fileList,
  alertList,
  fields,
  fieldsCreationError,
  setFields,
  hasUpdateRight,
  hasDeleteRight,
  onModalClose,
  schemaErrorLogMeta,
  dataChecking,
  onFileContentChange,
  onFileRemove,
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
      value: key,
      label: (
        <FieldTypeLabel>
          <Icon icon={value.icon} color={value.color} />
          <span>{value.title}</span>
        </FieldTypeLabel>
      ),
    }));
  }, []);

  const stepComponents = [
    {
      title: t("Select file"),
      content: (
        <FileSelectionStep
          fileList={fileList}
          alertList={alertList}
          onFileContentChange={onFileContentChange}
          onFileRemove={onFileRemove}
          dataChecking={dataChecking}
        />
      ),
    },
    {
      title: t("Error log"),
      content: <SchemaErrorLogStep errorLogMeta={schemaErrorLogMeta} />,
    },
    {
      title: t("Schema preview"),
      content: (
        <SchemaPreviewStep
          fields={fields}
          fieldTypeOptions={fieldTypeOptions}
          onDragEnd={handleDragEnd}
          onToggleFieldHide={handleToggleFieldHide}
          onToggleAllFieldsHide={handleToggleAllFieldHide}
          hasUpdateRight={hasUpdateRight}
          hasDeleteRight={hasDeleteRight}
        />
      ),
    },
    {
      title: t("Importing"),
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
      width={CustomToken.MODAL.WIDTH_MD}
      footer={
        <>
          {currentPage === 1 && schemaErrorLogMeta && (
            <Flex justify="space-between">
              <FooterActionButton
                icon={<Icon icon="download" />}
                type="text"
                onClick={() => ImportErrorLogUtils.downloadErrorLog(schemaErrorLogMeta)}>
                {t("Download error log")}
              </FooterActionButton>
              <FooterActionButton type="default" onClick={toFileSelectionStep}>
                {t("Go back")}
              </FooterActionButton>
            </Flex>
          )}
          {currentPage === 2 && (
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
                  }}>
                  {t("Import")}
                </Button>
              </Tooltip>
            </Flex>
          )}
        </>
      }
      styles={{
        body: { height: CustomToken.MODAL.HEIGHT_LG },
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
      padding-left: ${AntdToken.SPACING.SM}px;
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
  gap: ${AntdToken.SPACING.XS}px;
  font-weight: ${AntdToken.FONT_WEIGHT.NORMAL};
`;

const FooterActionButton = styled(Button)`
  text-transform: capitalize;
`;
