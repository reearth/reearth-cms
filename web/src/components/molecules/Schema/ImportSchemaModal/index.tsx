import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import Steps from "@reearth-cms/components/atoms/Step";
import { Trans, useT } from "@reearth-cms/i18n";

import { fieldTypes } from "../fieldTypes";
import useHooks from "../hooks";
import SelectFileModal from "../SelectFileModal";
import { Field, FieldType } from "../types";

import FileSelectionStep from "./FileSelectionStep";
import ImportingStep from "./ImportingStep";
import SchemaPreviewStep from "./SchemaPreviewStep";

type Props = {
  visible: boolean;
  selectFileModalVisible: boolean;
  currentPage: number;
  nextPage: () => void;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onSelectFile: () => void;
  onSelectSchemaFileModalClose: () => void;
  onModalClose: () => void;
};

const ImportSchemaModal: React.FC<Props> = ({
  visible,
  selectFileModalVisible,
  currentPage,
  nextPage,
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

  const {
    workspaceId,
    projectId,
    assetList,
    loading,
    totalCount,
    selectedAsset,
    uploadProps,
    fileList,
    uploadType,
    uploadUrl,
    uploading,
    setUploadUrl,
    setUploadType,
    hasCreateRight,
    uploadModalVisibility,
    displayUploadModal,
    page,
    pageSize,
    handleSelect,
    handleSearchTerm,
    handleAssetsReload,
    handleAssetTableChange,
    handleUploadModalCancel,
    handleUploadAndLink,
  } = useHooks();

  const stepComponents = [
    {
      title: "Select file",
      content: (
        <FileSelectionStep
          selectedAsset={selectedAsset}
          onSelectFile={onSelectFile}
          workspaceId={workspaceId}
          projectId={projectId}
          t={t}
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
          t={t}
        />
      ),
    },
    {
      title: "Importing",
      content: <ImportingStep t={t} />,
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
            <Button type="primary" disabled={!selectedAsset} onClick={nextPage}>
              {t("Next")}
            </Button>
          )}
          {currentPage === 1 && (
            <Button type="primary" onClick={nextPage}>
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
          onSelect={handleSelect}
          onSearchTerm={handleSearchTerm}
          onAssetsReload={handleAssetsReload}
          onAssetTableChange={handleAssetTableChange}
          onUploadModalCancel={handleUploadModalCancel}
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