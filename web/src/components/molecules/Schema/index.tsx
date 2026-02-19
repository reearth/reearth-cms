import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

import { AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Tabs, { TabsProps } from "@reearth-cms/components/atoms/Tabs";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { UploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import FieldList from "@reearth-cms/components/molecules/Schema/FieldList";
import ModelFieldList from "@reearth-cms/components/molecules/Schema/ModelFieldList";
import {
  Field,
  SchemaFieldType,
  Group,
  Tab,
  SelectedSchemaType,
  CreateFieldInput,
  ImportFieldInput,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { Constant } from "@reearth-cms/utils/constant";
import { ImportSchemaUtils } from "@reearth-cms/utils/importSchema";

import { ItemAsset } from "../Content/types";

import ImportSchemaModal from "./ImportSchemaModal";

type Props = {
  data?: Model | Group;
  collapsed: boolean;
  page: number;
  pageSize: number;
  assetList: Asset[];
  loading: boolean;
  fieldsCreationLoading: boolean;
  selectedAsset?: ItemAsset;
  selectedSchemaType: SelectedSchemaType;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  fileList: UploadFile[];
  alertList?: AlertProps[];
  uploadType: UploadType;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploading: boolean;
  importFields: ImportFieldInput[];
  fieldsCreationError?: boolean;
  setImportFields: Dispatch<SetStateAction<ImportFieldInput[]>>;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  totalCount: number;
  onSearchTerm: (term?: string) => void;
  onAssetsReload: () => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onAssetSelect: (id?: string) => void;
  onModalOpen: () => void;
  onDeletionModalOpen: () => void;
  modelsMenu: JSX.Element;
  setIsMeta: (isMeta: boolean) => void;
  onCollapse: (collapse: boolean) => void;
  onFieldReorder: (data: Field[]) => Promise<void>;
  onFieldUpdateModalOpen: (field: Field) => void;
  onFieldCreationModalOpen: (fieldType: SchemaFieldType) => void;
  onFieldDelete: (fieldId: string) => Promise<void>;
  onAllFieldsDelete: (fieldIds: string[]) => Promise<void>;
  importSchemaModalVisibility: boolean;
  selectFileModalVisibility: boolean;
  uploadModalVisibility: boolean;
  onSchemaImportModalOpen: () => void;
  onSchemaImportModalCancel: () => void;
  onSelectFileModalOpen: () => void;
  onSelectFileModalCancel: () => void;
  onUploadModalOpen: () => void;
  onUploadModalCancel: () => void;
  currentImportSchemaModalPage: number;
  toSchemaPreviewStep: () => void;
  toImportingStep: (fields: CreateFieldInput[]) => Promise<void>;
  toFileSelectionStep: () => void;
  dataChecking: boolean;
  onFileContentChange: UploadProps["beforeUpload"];
  onFileRemove: UploadProps["onRemove"];
};

const Schema: React.FC<Props> = ({
  data,
  collapsed,
  page,
  pageSize,
  assetList,
  loading,
  fieldsCreationLoading,
  selectedAsset,
  selectedSchemaType,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
  fileList,
  alertList,
  uploadType,
  uploadUrl,
  uploading,
  importFields,
  fieldsCreationError,
  setImportFields,
  setUploadUrl,
  setUploadType,
  totalCount,
  onSearchTerm,
  onAssetsReload,
  onAssetTableChange,
  onAssetSelect,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onModalOpen,
  onDeletionModalOpen,
  modelsMenu,
  setIsMeta,
  onCollapse,
  onFieldReorder,
  onFieldUpdateModalOpen,
  onFieldCreationModalOpen,
  onFieldDelete,
  onAllFieldsDelete,
  uploadModalVisibility,
  importSchemaModalVisibility,
  selectFileModalVisibility,
  onSchemaImportModalOpen,
  onSchemaImportModalCancel,
  onSelectFileModalOpen,
  onSelectFileModalCancel,
  onUploadModalOpen,
  onUploadModalCancel,
  currentImportSchemaModalPage,
  toSchemaPreviewStep,
  toImportingStep,
  toFileSelectionStep,
  dataChecking,
  onFileContentChange,
  onFileRemove,
}) => {
  const t = useT();

  const [tab, setTab] = useState<Tab>("fields");

  const hasModelFields = useMemo<boolean>(
    () => (data ? data.schema.fields.length > 0 : false),
    [data],
  );
  const getImportSchemaUIMetadata = useMemo(
    () => ImportSchemaUtils.getUIMetadata({ hasSchemaCreateRight: hasCreateRight, hasModelFields }),
    [hasModelFields, hasCreateRight],
  );

  const dropdownItems = useMemo(
    () => [
      {
        key: "edit",
        label: t("Edit"),
        icon: <StyledIcon icon="edit" />,
        onClick: onModalOpen,
        disabled: !hasUpdateRight,
      },
      {
        key: "import",
        label: (
          <Tooltip
            title={getImportSchemaUIMetadata.tooltipMessage}
            data-testid={DATA_TEST_ID.Schema__ImportSchemaButton}>
            {t("Import")}
          </Tooltip>
        ),
        icon: <StyledIcon icon="import" />,
        onClick: onSchemaImportModalOpen,
        disabled: getImportSchemaUIMetadata.shouldDisable,
      },
      {
        key: "delete",
        label: t("Delete"),
        icon: <StyledIcon icon="delete" />,
        onClick: onDeletionModalOpen,
        danger: true,
        disabled: !hasDeleteRight,
      },
    ],
    [
      t,
      onModalOpen,
      hasUpdateRight,
      getImportSchemaUIMetadata.tooltipMessage,
      getImportSchemaUIMetadata.shouldDisable,
      onSchemaImportModalOpen,
      onDeletionModalOpen,
      hasDeleteRight,
    ],
  );

  const DropdownMenu = useCallback(
    () => (
      <Dropdown key="more" menu={{ items: dropdownItems }} placement="bottomRight">
        <Button type="text" icon={<Icon icon="more" size={20} />} />
      </Dropdown>
    ),
    [dropdownItems],
  );

  const items: TabsProps["items"] = [
    {
      key: "fields",
      label: t("Fields"),
      children: (
        <div>
          <ModelFieldList
            fields={data?.schema.fields}
            hasUpdateRight={hasUpdateRight}
            hasDeleteRight={hasDeleteRight}
            hasCreateRight={hasCreateRight}
            handleFieldUpdateModalOpen={onFieldUpdateModalOpen}
            onFieldReorder={onFieldReorder}
            onFieldDelete={onFieldDelete}
            onSchemaImport={onSchemaImportModalOpen}
          />
        </div>
      ),
    },
    {
      key: "meta-data",
      label: <span data-testid={DATA_TEST_ID.Schema__MetaDataTab}>{t("Meta Data")}</span>,
      children: (
        <div>
          <ModelFieldList
            isMeta={true}
            fields={data && "metadataSchema" in data ? data?.metadataSchema?.fields : undefined}
            hasUpdateRight={hasUpdateRight}
            hasDeleteRight={hasDeleteRight}
            hasCreateRight={hasCreateRight}
            handleFieldUpdateModalOpen={onFieldUpdateModalOpen}
            onFieldReorder={onFieldReorder}
            onFieldDelete={onFieldDelete}
          />
        </div>
      ),
    },
  ];

  const handleTabChange = useCallback(
    (key: string) => {
      setTab(key as Tab);
      setIsMeta?.(key === "meta-data" && selectedSchemaType === "model");
    },
    [selectedSchemaType, setIsMeta],
  );

  return (
    <ComplexInnerContents
      left={
        <Sidebar
          collapsed={collapsed}
          onCollapse={onCollapse}
          collapsedWidth={54}
          width={208}
          trigger={<Icon icon={collapsed ? "panelToggleRight" : "panelToggleLeft"} />}>
          {modelsMenu}
        </Sidebar>
      }
      center={
        <Content>
          {data && (
            <>
              <PageHeader
                title={data.name}
                subTitle={`#${data.key}`}
                style={{ backgroundColor: "#fff" }}
                extra={[
                  Constant.IS_DEV && (
                    <Button
                      type="default"
                      shape="default"
                      size="small"
                      color="red"
                      variant="outlined"
                      onClick={() =>
                        data?.schema?.fields &&
                        onAllFieldsDelete(data.schema.fields.map(field => field.id))
                      }
                      disabled={!hasDeleteRight}>
                      Delete All Fields (Dev Only)
                    </Button>
                  ),

                  <DropdownMenu key="more" />,
                ]}
              />
              {selectedSchemaType === "model" && (
                <StyledTabs data-testid={DATA_TEST_ID.Schema__FieldsTabs} activeKey={tab} items={items} onChange={handleTabChange} />
              )}
              {selectedSchemaType === "group" && (
                <GroupFieldsWrapper>
                  <ModelFieldList
                    fields={data?.schema?.fields}
                    hasUpdateRight={hasUpdateRight}
                    hasDeleteRight={hasDeleteRight}
                    hasCreateRight={hasCreateRight}
                    handleFieldUpdateModalOpen={onFieldUpdateModalOpen}
                    onFieldReorder={onFieldReorder}
                    onFieldDelete={onFieldDelete}
                  />
                </GroupFieldsWrapper>
              )}
            </>
          )}
          <ImportSchemaModal
            page={page}
            pageSize={pageSize}
            assetList={assetList}
            loading={loading}
            fieldsCreationLoading={fieldsCreationLoading}
            visible={importSchemaModalVisibility}
            selectFileModalVisibility={selectFileModalVisibility}
            currentPage={currentImportSchemaModalPage}
            toSchemaPreviewStep={toSchemaPreviewStep}
            toImportingStep={toImportingStep}
            toFileSelectionStep={toFileSelectionStep}
            hasUpdateRight={hasUpdateRight}
            hasDeleteRight={hasDeleteRight}
            onUploadModalOpen={onUploadModalOpen}
            onUploadModalCancel={onUploadModalCancel}
            fileList={fileList}
            alertList={alertList}
            totalCount={totalCount}
            selectedAsset={selectedAsset}
            uploadType={uploadType}
            uploadUrl={uploadUrl}
            uploading={uploading}
            fields={importFields}
            fieldsCreationError={fieldsCreationError}
            setFields={setImportFields}
            setUploadUrl={setUploadUrl}
            setUploadType={setUploadType}
            hasCreateRight={hasCreateRight}
            uploadModalVisibility={uploadModalVisibility}
            onSearchTerm={onSearchTerm}
            onAssetsReload={onAssetsReload}
            onAssetTableChange={onAssetTableChange}
            onAssetSelect={onAssetSelect}
            onAssetsCreate={onAssetsCreate}
            onAssetCreateFromUrl={onAssetCreateFromUrl}
            onSelectFile={onSelectFileModalOpen}
            onSelectFileModalCancel={onSelectFileModalCancel}
            onModalClose={onSchemaImportModalCancel}
            dataChecking={dataChecking}
            onFileContentChange={onFileContentChange}
            onFileRemove={onFileRemove}
          />
        </Content>
      }
      right={
        <FieldListWrapper>
          <FieldList
            currentTab={tab}
            selectedSchemaType={selectedSchemaType}
            hasCreateRight={hasCreateRight}
            addField={onFieldCreationModalOpen}
          />
        </FieldListWrapper>
      }
    />
  );
};

export default Schema;

const Content = styled.div`
  width: 100%;
  height: 100%;
  background: #fafafa;
`;

const FieldListWrapper = styled.div`
  height: 100%;
  width: 272px;
  padding: 12px 12px 0;
`;

const StyledTabs = styled(Tabs)`
  max-height: calc(100% - 72px);
  .ant-tabs-nav {
    padding: 0 24px;
    margin-bottom: 12px;
    background: #fff;
  }
  .ant-tabs-content-holder {
    overflow-y: auto;
    padding: 0 24px 24px;
  }
`;

const GroupFieldsWrapper = styled.div`
  max-height: calc(100% - 72px);
  overflow-y: auto;
  padding: 24px;
`;

const StyledIcon = styled(Icon)`
  margin-right: 12px;
`;
