import styled from "@emotion/styled";
import { Key, useCallback } from "react";

import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ColumnsState } from "@reearth-cms/components/atoms/ProTable";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import AssetListTable from "@reearth-cms/components/molecules/Asset/AssetListTable";
import { Asset, AssetItem, SortType } from "@reearth-cms/components/molecules/Asset/types";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import { useT } from "@reearth-cms/i18n";

export type UploadType = "local" | "url";

type Props = {
  commentsPanel: JSX.Element;
  assetList: Asset[];
  fileList: UploadFile[];
  selection: {
    selectedRowKeys: Key[];
  };
  uploading: boolean;
  uploadModalVisibility: boolean;
  loading: boolean;
  deleteLoading: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType: UploadType;
  selectedAsset?: Asset;
  totalCount: number;
  page: number;
  pageSize: number;
  sort?: SortType;
  searchTerm: string;
  columns: Record<string, ColumnsState>;
  hasCreateRight: boolean;
  hasDeleteRight: boolean;
  onColumnsChange: (cols: Record<string, ColumnsState>) => void;
  onAssetItemSelect: (item: AssetItem) => void;
  onAssetSelect: (assetId: string) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetDelete: (assetIds: string[]) => Promise<void>;
  onSearchTerm: (term?: string) => void;
  onEdit: (assetId: string) => void;
  onSelect: (selectedRowKeys: Key[], selectedRows: Asset[]) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
};

const AssetList: React.FC<Props> = ({
  commentsPanel,
  assetList,
  fileList,
  selection,
  uploading,
  uploadModalVisibility,
  loading,
  deleteLoading,
  uploadUrl,
  uploadType,
  selectedAsset,
  totalCount,
  page,
  pageSize,
  sort,
  searchTerm,
  columns,
  hasCreateRight,
  hasDeleteRight,
  onColumnsChange,
  onAssetItemSelect,
  onAssetSelect,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetDelete,
  onSearchTerm,
  onEdit,
  onSelect,
  setFileList,
  setUploadModalVisibility,
  onAssetsReload,
  onAssetTableChange,
}) => {
  const t = useT();

  const displayUploadModal = useCallback(() => {
    setUploadModalVisibility(true);
  }, [setUploadModalVisibility]);

  const handleUpload = useCallback(async () => {
    if (uploadType === "url") {
      await onAssetCreateFromUrl(uploadUrl.url, uploadUrl.autoUnzip);
    } else {
      await onAssetsCreate(fileList);
    }
  }, [uploadType, onAssetCreateFromUrl, uploadUrl, onAssetsCreate, fileList]);

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    directory: false,
    showUploadList: true,
    accept: "*",
    listType: "picture",
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (_file, files) => {
      setFileList([...fileList, ...files]);
      return false;
    },
    fileList,
  };

  return (
    <ComplexInnerContents
      center={
        <Wrapper>
          <StyledPageHeader
            title={t("Asset")}
            extra={
              <UploadAsset
                uploadProps={uploadProps}
                fileList={fileList}
                uploading={uploading}
                uploadModalVisibility={uploadModalVisibility}
                uploadUrl={uploadUrl}
                uploadType={uploadType}
                hasCreateRight={hasCreateRight}
                setUploadUrl={setUploadUrl}
                setUploadType={setUploadType}
                displayUploadModal={displayUploadModal}
                onUploadModalCancel={onUploadModalCancel}
                onUpload={handleUpload}
              />
            }
          />
          <AssetListTable
            assetList={assetList}
            selection={selection}
            loading={loading}
            deleteLoading={deleteLoading}
            selectedAsset={selectedAsset}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            sort={sort}
            searchTerm={searchTerm}
            columns={columns}
            hasDeleteRight={hasDeleteRight}
            onColumnsChange={onColumnsChange}
            onAssetItemSelect={onAssetItemSelect}
            onAssetSelect={onAssetSelect}
            onEdit={onEdit}
            onSearchTerm={onSearchTerm}
            onSelect={onSelect}
            onAssetsReload={onAssetsReload}
            onAssetDelete={onAssetDelete}
            onAssetTableChange={onAssetTableChange}
          />
        </Wrapper>
      }
      right={commentsPanel}
    />
  );
};

export default AssetList;

const Wrapper = styled.div`
  background: #fff;
  width: 100%;
  height: 100%;
`;

const StyledPageHeader = styled(PageHeader)`
  border-bottom: 1px solid #00000008;
`;
