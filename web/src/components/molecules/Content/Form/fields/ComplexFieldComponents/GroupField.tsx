import Form, { FormInstance } from "@reearth-cms/components/atoms/Form";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import GroupItem from "@reearth-cms/components/molecules/Common/Form/GroupItem";
import MultiValueGroup from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGroup";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import { FormItem, ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { Group, Field } from "@reearth-cms/components/molecules/Schema/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";

interface GroupFieldProps {
  field: Field;
  form?: FormInstance<any>;
  groups?: Group[];
  linkedItemsModalList?: FormItem[];
  linkItemModalTitle: string;
  formItemsData: FormItem[];
  itemAssets?: ItemAsset[];
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType: UploadType;
  totalCount: number;
  page: number;
  pageSize: number;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onSearchTerm: (term?: string) => void;
  onReferenceModelUpdate: (modelId?: string) => void;
  onLinkItemTableReload: () => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
}

const GroupField: React.FC<GroupFieldProps> = ({
  field,
  form,
  groups,
  linkedItemsModalList,
  linkItemModalTitle,
  formItemsData,
  itemAssets,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  totalCount,
  page,
  pageSize,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onSearchTerm,
  onReferenceModelUpdate,
  onLinkItemTableReload,
  onLinkItemTableChange,
  onAssetTableChange,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onGetAsset,
}) => {
  return (
    <Form.Item
      extra={field.description}
      name={field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      {field.multiple ? (
        <MultiValueGroup
          parentField={field}
          form={form}
          groups={groups}
          linkedItemsModalList={linkedItemsModalList}
          linkItemModalTitle={linkItemModalTitle}
          onSearchTerm={onSearchTerm}
          formItemsData={formItemsData}
          itemAssets={itemAssets}
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
          onLinkItemTableReload={onLinkItemTableReload}
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
          onGetAsset={onGetAsset}
        />
      ) : (
        <GroupItem
          parentField={field}
          linkedItemsModalList={linkedItemsModalList}
          linkItemModalTitle={linkItemModalTitle}
          onSearchTerm={onSearchTerm}
          formItemsData={formItemsData}
          itemAssets={itemAssets}
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
          onLinkItemTableReload={onLinkItemTableReload}
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
          onGetAsset={onGetAsset}
        />
      )}
    </Form.Item>
  );
};

export default GroupField;
