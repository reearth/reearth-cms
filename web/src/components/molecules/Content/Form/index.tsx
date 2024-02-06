import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import GroupItem from "@reearth-cms/components/molecules//Common/Form/GroupItem";
import MultiValueGroup from "@reearth-cms/components/molecules//Common/MultiValueField/MultiValueGroup";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import AssetItem from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import MultiValueAsset from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueAsset";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import ReferenceFormItem from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import ContentSidebarWrapper from "@reearth-cms/components/molecules/Content/Form/SidebarWrapper";
import LinkItemRequestModal from "@reearth-cms/components/molecules/Content/LinkItemRequestModal/LinkItemRequestModal";
import PublishItemModal from "@reearth-cms/components/molecules/Content/PublishItemModal";
import RequestCreationModal from "@reearth-cms/components/molecules/Content/RequestCreationModal";
import { Item, FormItem, ItemField } from "@reearth-cms/components/molecules/Content/types";
import { Request, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { Group, Model } from "@reearth-cms/components/molecules/Schema/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";

import { DefaultField } from "./fields/FieldComponents";
import { FIELD_TYPE_COMPONENT_MAP } from "./fields/FieldTypesMap";
import useHooks from "./hooks";

export interface Props {
  item?: Item;
  groups?: Group[];
  linkedItemsModalList?: FormItem[];
  showPublishAction?: boolean;
  requests: Request[];
  itemId?: string;
  formItemsData: FormItem[];
  initialFormValues: any;
  initialMetaFormValues: any;
  loading: boolean;
  model?: Model;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType: UploadType;
  requestModalShown: boolean;
  requestCreationLoading: boolean;
  addItemToRequestModalShown: boolean;
  workspaceUserMembers: Member[];
  totalCount: number;
  page: number;
  pageSize: number;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  linkItemModalTitle: string;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onReferenceModelUpdate: (modelId?: string) => void;
  onSearchTerm: (term?: string) => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onRequestSearchTerm: (term: string) => void;
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onItemCreate: (data: {
    schemaId: string;
    metaSchemaId?: string;
    fields: ItemField[];
    metaFields: ItemField[];
  }) => Promise<void>;
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>;
  onMetaItemUpdate: (data: { metaItemId: string; metaFields: ItemField[] }) => Promise<void>;
  onBack: (modelId?: string) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  onPublish: (itemIds: string[]) => Promise<void>;
  onRequestCreate: (data: {
    title: string;
    description: string;
    state: RequestState;
    reviewersId: string[];
    items: {
      itemId: string;
    }[];
  }) => Promise<void>;
  onChange: (request: Request, itemIds: string[]) => void;
  onModalClose: () => void;
  onModalOpen: () => void;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
}

const ContentForm: React.FC<Props> = ({
  item,
  groups,
  linkedItemsModalList,
  showPublishAction,
  requests,
  itemId,
  model,
  formItemsData,
  initialFormValues,
  initialMetaFormValues,
  loading,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  requestModalShown,
  addItemToRequestModalShown,
  workspaceUserMembers,
  totalCount,
  page,
  pageSize,
  onRequestTableChange,
  onRequestSearchTerm,
  requestModalLoading,
  requestModalTotalCount,
  requestModalPage,
  requestModalPageSize,
  requestCreationLoading,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onReferenceModelUpdate,
  onLinkItemTableChange,
  onPublish,
  onAssetTableChange,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onItemCreate,
  onItemUpdate,
  onMetaItemUpdate,
  onBack,
  onUnpublish,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onRequestCreate,
  onChange,
  onModalClose,
  onModalOpen,
  onAddItemToRequestModalOpen,
  onAddItemToRequestModalClose,
}) => {
  const t = useT();
  const {
    items,
    form,
    metaForm,
    unpublishedItems,
    publishModalOpen,
    handleValuesChange,
    handleBack,
    handleSubmit,
    handleMetaUpdate,
    handlePublishSubmit,
    handlePublishItemClose,
  } = useHooks(
    formItemsData,
    initialFormValues,
    initialMetaFormValues,
    onItemCreate,
    onItemUpdate,
    onMetaItemUpdate,
    onBack,
    onUnpublish,
    onPublish,
    onModalOpen,
    onAddItemToRequestModalOpen,
    item,
    groups,
    showPublishAction,
    itemId,
    model,
  );

  return (
    <>
      <StyledForm
        form={form}
        layout="vertical"
        initialValues={initialFormValues}
        onValuesChange={handleValuesChange}>
        <PageHeader
          title={model?.name}
          onBack={handleBack}
          extra={
            <>
              <Button htmlType="submit" onClick={handleSubmit} loading={loading}>
                {t("Save")}
              </Button>
              {itemId && (
                <>
                  {showPublishAction && (
                    <Button type="primary" onClick={handlePublishSubmit}>
                      {t("Publish")}
                    </Button>
                  )}
                  {!showPublishAction && (
                    <Button type="primary" onClick={onModalOpen}>
                      {t("New Request")}
                    </Button>
                  )}
                  <Dropdown menu={{ items }} trigger={["click"]}>
                    <Button>
                      <Icon icon="ellipsis" />
                    </Button>
                  </Dropdown>
                </>
              )}
            </>
          }
        />
        <FormItemsWrapper>
          {model?.schema.fields.map(field => {
            const FieldComponent =
              FIELD_TYPE_COMPONENT_MAP[
                field.type as
                  | "Select"
                  | "Date"
                  | "Tag"
                  | "Bool"
                  | "Checkbox"
                  | "URL"
                  | "TextArea"
                  | "MarkdownText"
                  | "Integer"
              ] || DefaultField;
            if (field.type === "Asset") {
              return (
                <StyledFormItem
                  key={field.id}
                  extra={field.description}
                  rules={[
                    {
                      required: field.required,
                      message: t("Please input field!"),
                    },
                  ]}
                  name={field.id}
                  label={
                    <FieldTitle
                      title={field.title}
                      isUnique={field.unique}
                      isTitle={field.isTitle}
                    />
                  }>
                  {field.multiple ? (
                    <MultiValueAsset
                      assetList={assetList}
                      fileList={fileList}
                      loadingAssets={loadingAssets}
                      uploading={uploading}
                      uploadModalVisibility={uploadModalVisibility}
                      uploadUrl={uploadUrl}
                      uploadType={uploadType}
                      totalCount={totalCount}
                      page={page}
                      pageSize={pageSize}
                      onAssetTableChange={onAssetTableChange}
                      onUploadModalCancel={onUploadModalCancel}
                      setUploadUrl={setUploadUrl}
                      setUploadType={setUploadType}
                      onAssetsCreate={onAssetsCreate}
                      onAssetCreateFromUrl={onAssetCreateFromUrl}
                      onAssetsReload={onAssetsReload}
                      onAssetSearchTerm={onAssetSearchTerm}
                      setFileList={setFileList}
                      setUploadModalVisibility={setUploadModalVisibility}
                    />
                  ) : (
                    <AssetItem
                      key={field.id}
                      assetList={assetList}
                      fileList={fileList}
                      loadingAssets={loadingAssets}
                      uploading={uploading}
                      uploadModalVisibility={uploadModalVisibility}
                      uploadUrl={uploadUrl}
                      uploadType={uploadType}
                      totalCount={totalCount}
                      page={page}
                      pageSize={pageSize}
                      onAssetTableChange={onAssetTableChange}
                      onUploadModalCancel={onUploadModalCancel}
                      setUploadUrl={setUploadUrl}
                      setUploadType={setUploadType}
                      onAssetsCreate={onAssetsCreate}
                      onAssetCreateFromUrl={onAssetCreateFromUrl}
                      onAssetsReload={onAssetsReload}
                      onAssetSearchTerm={onAssetSearchTerm}
                      setFileList={setFileList}
                      setUploadModalVisibility={setUploadModalVisibility}
                    />
                  )}
                </StyledFormItem>
              );
            }

            if (field.type === "Reference") {
              return (
                <StyledFormItem
                  key={field.id}
                  extra={field.description}
                  name={field.id}
                  label={
                    <FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />
                  }>
                  <ReferenceFormItem
                    key={field.id}
                    correspondingFieldId={field.id}
                    formItemsData={formItemsData}
                    modelId={field.typeProperty?.modelId}
                    onReferenceModelUpdate={onReferenceModelUpdate}
                    linkedItemsModalList={linkedItemsModalList}
                    linkItemModalTotalCount={linkItemModalTotalCount}
                    linkItemModalPage={linkItemModalPage}
                    linkItemModalPageSize={linkItemModalPageSize}
                    onLinkItemTableChange={onLinkItemTableChange}
                  />
                </StyledFormItem>
              );
            }

            if (field.type === "Group") {
              return (
                <StyledFormItem
                  key={field.id}
                  extra={field.description}
                  name={field.id}
                  label={
                    <FieldTitle
                      title={field.title}
                      isUnique={field.unique}
                      isTitle={field.isTitle}
                    />
                  }>
                  {field.multiple ? (
                    <MultiValueGroup
                      parentField={field}
                      form={form}
                      groups={groups}
                      linkedItemsModalList={linkedItemsModalList}
                      formItemsData={formItemsData}
                      assetList={assetList}
                      fileList={fileList}
                      loadingAssets={loadingAssets}
                      uploading={uploading}
                      uploadModalVisibility={uploadModalVisibility}
                      uploadUrl={uploadUrl}
                      uploadType={uploadType}
                      totalCount={totalCount}
                      page={page}
                      pageSize={pageSize}
                      linkItemModalTotalCount={linkItemModalTotalCount}
                      linkItemModalPage={linkItemModalPage}
                      linkItemModalPageSize={linkItemModalPageSize}
                      onReferenceModelUpdate={onReferenceModelUpdate}
                      onLinkItemTableChange={onLinkItemTableChange}
                      onAssetTableChange={onAssetTableChange}
                      onUploadModalCancel={onUploadModalCancel}
                      setUploadUrl={setUploadUrl}
                      setUploadType={setUploadType}
                      onAssetsCreate={onAssetsCreate}
                      onAssetCreateFromUrl={onAssetCreateFromUrl}
                      onAssetsReload={onAssetsReload}
                      onAssetSearchTerm={onAssetSearchTerm}
                      setFileList={setFileList}
                      setUploadModalVisibility={setUploadModalVisibility}
                    />
                  ) : (
                    <GroupItem
                      parentField={field}
                      linkedItemsModalList={linkedItemsModalList}
                      formItemsData={formItemsData}
                      assetList={assetList}
                      fileList={fileList}
                      loadingAssets={loadingAssets}
                      uploading={uploading}
                      uploadModalVisibility={uploadModalVisibility}
                      uploadUrl={uploadUrl}
                      uploadType={uploadType}
                      totalCount={totalCount}
                      page={page}
                      pageSize={pageSize}
                      linkItemModalTotalCount={linkItemModalTotalCount}
                      linkItemModalPage={linkItemModalPage}
                      linkItemModalPageSize={linkItemModalPageSize}
                      onReferenceModelUpdate={onReferenceModelUpdate}
                      onLinkItemTableChange={onLinkItemTableChange}
                      onAssetTableChange={onAssetTableChange}
                      onUploadModalCancel={onUploadModalCancel}
                      setUploadUrl={setUploadUrl}
                      setUploadType={setUploadType}
                      onAssetsCreate={onAssetsCreate}
                      onAssetCreateFromUrl={onAssetCreateFromUrl}
                      onAssetsReload={onAssetsReload}
                      onAssetSearchTerm={onAssetSearchTerm}
                      setFileList={setFileList}
                      setUploadModalVisibility={setUploadModalVisibility}
                    />
                  )}
                </StyledFormItem>
              );
            }

            return (
              <StyledFormItemWrapper key={field.id}>
                <FieldComponent field={field} />
              </StyledFormItemWrapper>
            );
          })}
        </FormItemsWrapper>
      </StyledForm>
      <SideBarWrapper>
        <Form form={metaForm} layout="vertical" initialValues={initialMetaFormValues}>
          <ContentSidebarWrapper item={item} />
          {model?.metadataSchema?.fields?.map(field => {
            const FieldComponent =
              FIELD_TYPE_COMPONENT_MAP[
                field.type as "Tag" | "Date" | "Bool" | "Checkbox" | "URL"
              ] || DefaultField;
            return (
              <MetaFormItemWrapper key={field.id}>
                <FieldComponent field={field} handleBlurUpdate={handleMetaUpdate} />
              </MetaFormItemWrapper>
            );
          })}
        </Form>
      </SideBarWrapper>
      {itemId && (
        <>
          <RequestCreationModal
            unpublishedItems={unpublishedItems}
            itemId={itemId}
            open={requestModalShown}
            onClose={onModalClose}
            onSubmit={onRequestCreate}
            requestCreationLoading={requestCreationLoading}
            workspaceUserMembers={workspaceUserMembers}
          />
          <LinkItemRequestModal
            itemIds={[itemId]}
            onChange={onChange}
            onLinkItemRequestModalCancel={onAddItemToRequestModalClose}
            visible={addItemToRequestModalShown}
            linkedRequest={undefined}
            requestList={requests}
            onRequestTableChange={onRequestTableChange}
            requestModalLoading={requestModalLoading}
            requestModalTotalCount={requestModalTotalCount}
            requestModalPage={requestModalPage}
            requestModalPageSize={requestModalPageSize}
            onRequestSearchTerm={onRequestSearchTerm}
          />
          <PublishItemModal
            unpublishedItems={unpublishedItems}
            itemId={itemId}
            open={publishModalOpen}
            onClose={handlePublishItemClose}
            onSubmit={onPublish}
          />
        </>
      )}
    </>
  );
};

const StyledFormItem = styled(Form.Item)`
  width: 500px;
  word-wrap: break-word;
`;

const StyledFormItemWrapper = styled.div`
  width: 500px;
  word-wrap: break-word;
`;

const StyledForm = styled(Form)`
  width: 100%;
  height: 100%;
  background: #fff;
  label {
    width: 100%;
    display: flex;
  }
`;

const FormItemsWrapper = styled.div`
  max-height: calc(100% - 72px);
  overflow-y: auto;
  padding: 36px;
`;

const SideBarWrapper = styled.div`
  background-color: #fafafa;
  padding: 8px;
  width: 400px;
  max-height: 100%;
  overflow-y: auto;
`;

const MetaFormItemWrapper = styled.div`
  padding: 12px;
  margin-bottom: 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 2px;
`;

export default ContentForm;
