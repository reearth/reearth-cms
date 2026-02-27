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
  CreateFieldInput,
  Field,
  Group,
  ImportFieldInput,
  SchemaFieldType,
  SelectedSchemaType,
  Tab,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { Constant } from "@reearth-cms/utils/constant";
import { ImportSchemaUtils } from "@reearth-cms/utils/importSchema";

import { ItemAsset } from "../Content/types";
import ImportSchemaModal from "./ImportSchemaModal";

type Props = {
  alertList?: AlertProps[];
  assetList: Asset[];
  collapsed: boolean;
  currentImportSchemaModalPage: number;
  data?: Group | Model;
  dataChecking: boolean;
  fieldsCreationError?: boolean;
  fieldsCreationLoading: boolean;
  fileList: UploadFile[];
  hasCreateRight: boolean;
  hasDeleteRight: boolean;
  hasUpdateRight: boolean;
  importFields: ImportFieldInput[];
  importSchemaModalVisibility: boolean;
  loading: boolean;
  modelsMenu: JSX.Element;
  onAllFieldsDelete: (fieldIds: string[]) => Promise<void>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetSelect: (id?: string) => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onCollapse: (collapse: boolean) => void;
  onDeletionModalOpen: () => void;
  onFieldCreationModalOpen: (fieldType: SchemaFieldType) => void;
  onFieldDelete: (fieldId: string) => Promise<void>;
  onFieldReorder: (data: Field[]) => Promise<void>;
  onFieldUpdateModalOpen: (field: Field) => void;
  onFileContentChange: UploadProps["beforeUpload"];
  onFileRemove: UploadProps["onRemove"];
  onModalOpen: () => void;
  onSchemaImportModalCancel: () => void;
  onSchemaImportModalOpen: () => void;
  onSearchTerm: (term?: string) => void;
  onSelectFileModalCancel: () => void;
  onSelectFileModalOpen: () => void;
  onUploadModalCancel: () => void;
  onUploadModalOpen: () => void;
  page: number;
  pageSize: number;
  selectedAsset?: ItemAsset;
  selectedSchemaType: SelectedSchemaType;
  selectFileModalVisibility: boolean;
  setImportFields: Dispatch<SetStateAction<ImportFieldInput[]>>;
  setIsMeta: (isMeta: boolean) => void;
  setUploadType: (type: UploadType) => void;
  setUploadUrl: (uploadUrl: { autoUnzip: boolean; url: string; }) => void;
  toFileSelectionStep: () => void;
  toImportingStep: (fields: CreateFieldInput[]) => Promise<void>;
  toSchemaPreviewStep: () => void;
  totalCount: number;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadType: UploadType;
  uploadUrl: { autoUnzip: boolean; url: string; };
};

const Schema: React.FC<Props> = ({
  alertList,
  assetList,
  collapsed,
  currentImportSchemaModalPage,
  data,
  dataChecking,
  fieldsCreationError,
  fieldsCreationLoading,
  fileList,
  hasCreateRight,
  hasDeleteRight,
  hasUpdateRight,
  importFields,
  importSchemaModalVisibility,
  loading,
  modelsMenu,
  onAllFieldsDelete,
  onAssetCreateFromUrl,
  onAssetsCreate,
  onAssetSelect,
  onAssetsReload,
  onAssetTableChange,
  onCollapse,
  onDeletionModalOpen,
  onFieldCreationModalOpen,
  onFieldDelete,
  onFieldReorder,
  onFieldUpdateModalOpen,
  onFileContentChange,
  onFileRemove,
  onModalOpen,
  onSchemaImportModalCancel,
  onSchemaImportModalOpen,
  onSearchTerm,
  onSelectFileModalCancel,
  onSelectFileModalOpen,
  onUploadModalCancel,
  onUploadModalOpen,
  page,
  pageSize,
  selectedAsset,
  selectedSchemaType,
  selectFileModalVisibility,
  setImportFields,
  setIsMeta,
  setUploadType,
  setUploadUrl,
  toFileSelectionStep,
  toImportingStep,
  toSchemaPreviewStep,
  totalCount,
  uploading,
  uploadModalVisibility,
  uploadType,
  uploadUrl,
}) => {
  const t = useT();

  const [tab, setTab] = useState<Tab>("fields");

  const hasModelFields = useMemo<boolean>(
    () => (data ? data.schema.fields.length > 0 : false),
    [data],
  );
  const getImportSchemaUIMetadata = useMemo(
    () => ImportSchemaUtils.getUIMetadata({ hasModelFields, hasSchemaCreateRight: hasCreateRight }),
    [hasModelFields, hasCreateRight],
  );

  const dropdownItems = useMemo(
    () => [
      {
        disabled: !hasUpdateRight,
        icon: <StyledIcon icon="edit" />,
        key: "edit",
        label: t("Edit"),
        onClick: onModalOpen,
      },
      {
        disabled: getImportSchemaUIMetadata.shouldDisable,
        icon: <StyledIcon icon="import" />,
        key: "import",
        label: (
          <Tooltip
            data-testid={DATA_TEST_ID.Schema__ImportSchemaButton}
            title={getImportSchemaUIMetadata.tooltipMessage}>
            {t("Import")}
          </Tooltip>
        ),
        onClick: onSchemaImportModalOpen,
      },
      {
        danger: true,
        disabled: !hasDeleteRight,
        icon: <StyledIcon icon="delete" />,
        key: "delete",
        label: t("Delete"),
        onClick: onDeletionModalOpen,
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
        <Button icon={<Icon icon="more" size={20} />} type="text" />
      </Dropdown>
    ),
    [dropdownItems],
  );

  const items: TabsProps["items"] = [
    {
      children: (
        <div>
          <ModelFieldList
            fields={data?.schema.fields}
            handleFieldUpdateModalOpen={onFieldUpdateModalOpen}
            hasCreateRight={hasCreateRight}
            hasDeleteRight={hasDeleteRight}
            hasUpdateRight={hasUpdateRight}
            onFieldDelete={onFieldDelete}
            onFieldReorder={onFieldReorder}
            onSchemaImport={onSchemaImportModalOpen}
          />
        </div>
      ),
      key: "fields",
      label: t("Fields"),
    },
    {
      children: (
        <div>
          <ModelFieldList
            fields={data && "metadataSchema" in data ? data?.metadataSchema?.fields : undefined}
            handleFieldUpdateModalOpen={onFieldUpdateModalOpen}
            hasCreateRight={hasCreateRight}
            hasDeleteRight={hasDeleteRight}
            hasUpdateRight={hasUpdateRight}
            isMeta={true}
            onFieldDelete={onFieldDelete}
            onFieldReorder={onFieldReorder}
          />
        </div>
      ),
      key: "meta-data",
      label: t("Meta Data"),
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
      center={
        <Content>
          {data && (
            <>
              <PageHeader
                extra={[
                  Constant.IS_DEV && (
                    <Button
                      color="red"
                      disabled={!hasDeleteRight}
                      onClick={() =>
                        data?.schema?.fields &&
                        onAllFieldsDelete(data.schema.fields.map(field => field.id))
                      }
                      shape="default"
                      size="small"
                      type="default"
                      variant="outlined">
                      Delete All Fields (Dev Only)
                    </Button>
                  ),

                  <DropdownMenu key="more" />,
                ]}
                style={{ backgroundColor: "#fff" }}
                subTitle={`#${data.key}`}
                title={data.name}
              />
              {selectedSchemaType === "model" && (
                <StyledTabs activeKey={tab} items={items} onChange={handleTabChange} />
              )}
              {selectedSchemaType === "group" && (
                <GroupFieldsWrapper>
                  <ModelFieldList
                    fields={data?.schema?.fields}
                    handleFieldUpdateModalOpen={onFieldUpdateModalOpen}
                    hasCreateRight={hasCreateRight}
                    hasDeleteRight={hasDeleteRight}
                    hasUpdateRight={hasUpdateRight}
                    onFieldDelete={onFieldDelete}
                    onFieldReorder={onFieldReorder}
                  />
                </GroupFieldsWrapper>
              )}
            </>
          )}
          <ImportSchemaModal
            alertList={alertList}
            assetList={assetList}
            currentPage={currentImportSchemaModalPage}
            dataChecking={dataChecking}
            fields={importFields}
            fieldsCreationError={fieldsCreationError}
            fieldsCreationLoading={fieldsCreationLoading}
            fileList={fileList}
            hasCreateRight={hasCreateRight}
            hasDeleteRight={hasDeleteRight}
            hasUpdateRight={hasUpdateRight}
            loading={loading}
            onAssetCreateFromUrl={onAssetCreateFromUrl}
            onAssetsCreate={onAssetsCreate}
            onAssetSelect={onAssetSelect}
            onAssetsReload={onAssetsReload}
            onAssetTableChange={onAssetTableChange}
            onFileContentChange={onFileContentChange}
            onFileRemove={onFileRemove}
            onModalClose={onSchemaImportModalCancel}
            onSearchTerm={onSearchTerm}
            onSelectFile={onSelectFileModalOpen}
            onSelectFileModalCancel={onSelectFileModalCancel}
            onUploadModalCancel={onUploadModalCancel}
            onUploadModalOpen={onUploadModalOpen}
            page={page}
            pageSize={pageSize}
            selectedAsset={selectedAsset}
            selectFileModalVisibility={selectFileModalVisibility}
            setFields={setImportFields}
            setUploadType={setUploadType}
            setUploadUrl={setUploadUrl}
            toFileSelectionStep={toFileSelectionStep}
            toImportingStep={toImportingStep}
            toSchemaPreviewStep={toSchemaPreviewStep}
            totalCount={totalCount}
            uploading={uploading}
            uploadModalVisibility={uploadModalVisibility}
            uploadType={uploadType}
            uploadUrl={uploadUrl}
            visible={importSchemaModalVisibility}
          />
        </Content>
      }
      left={
        <Sidebar
          collapsed={collapsed}
          collapsedWidth={54}
          onCollapse={onCollapse}
          trigger={<Icon icon={collapsed ? "panelToggleRight" : "panelToggleLeft"} />}
          width={208}>
          {modelsMenu}
        </Sidebar>
      }
      right={
        <FieldListWrapper>
          <FieldList
            addField={onFieldCreationModalOpen}
            currentTab={tab}
            hasCreateRight={hasCreateRight}
            selectedSchemaType={selectedSchemaType}
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
