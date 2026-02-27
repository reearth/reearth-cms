import styled from "@emotion/styled";
import { Key, useCallback } from "react";

import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ColumnsState } from "@reearth-cms/components/atoms/ProTable";
import { UploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import AssetListTable from "@reearth-cms/components/molecules/Asset/AssetListTable";
import { Asset, AssetItem, SortType } from "@reearth-cms/components/molecules/Asset/types";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import { useT } from "@reearth-cms/i18n";

export type UploadType = "local" | "url";

type Props = {
  assetList: Asset[];
  columns: Record<string, ColumnsState>;
  commentsPanel: JSX.Element;
  deleteLoading: boolean;
  fileList: UploadFile[];
  hasCreateRight: boolean;
  hasDeleteRight: boolean;
  loading: boolean;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetDelete: (assetIds: string[]) => Promise<void>;
  onAssetDownload: (selected: Asset[]) => Promise<void>;
  onAssetItemSelect: (item: AssetItem) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetSelect: (assetId: string) => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onColumnsChange: (cols: Record<string, ColumnsState>) => void;
  onEdit: (assetId: string) => void;
  onSearchTerm: (term?: string) => void;
  onSelect: (selectedRowKeys: Key[], selectedRows: Asset[]) => void;
  onUploadModalCancel: () => void;
  page: number;
  pageSize: number;
  searchTerm: string;
  selectedAsset?: Asset;
  selection: {
    selectedRowKeys: Key[];
  };
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  setUploadType: (type: UploadType) => void;
  setUploadUrl: (uploadUrl: { autoUnzip: boolean; url: string; }) => void;
  sort?: SortType;
  totalCount: number;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadType: UploadType;
  uploadUrl: { autoUnzip: boolean; url: string; };
};

const AssetList: React.FC<Props> = ({
  assetList,
  columns,
  commentsPanel,
  deleteLoading,
  fileList,
  hasCreateRight,
  hasDeleteRight,
  loading,
  onAssetCreateFromUrl,
  onAssetDelete,
  onAssetDownload,
  onAssetItemSelect,
  onAssetsCreate,
  onAssetSelect,
  onAssetsReload,
  onAssetTableChange,
  onColumnsChange,
  onEdit,
  onSearchTerm,
  onSelect,
  onUploadModalCancel,
  page,
  pageSize,
  searchTerm,
  selectedAsset,
  selection,
  setFileList,
  setUploadModalVisibility,
  setUploadType,
  setUploadUrl,
  sort,
  totalCount,
  uploading,
  uploadModalVisibility,
  uploadType,
  uploadUrl,
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
    accept: "*",
    beforeUpload: (_file, files) => {
      setFileList([...fileList, ...files]);
      return false;
    },
    directory: false,
    fileList,
    listType: "picture",
    multiple: true,
    name: "file",
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    showUploadList: true,
  };

  return (
    <ComplexInnerContents
      center={
        <Wrapper>
          <StyledPageHeader
            extra={
              <UploadAsset
                displayUploadModal={displayUploadModal}
                fileList={fileList}
                hasCreateRight={hasCreateRight}
                onUpload={handleUpload}
                onUploadModalCancel={onUploadModalCancel}
                setUploadType={setUploadType}
                setUploadUrl={setUploadUrl}
                uploading={uploading}
                uploadModalVisibility={uploadModalVisibility}
                uploadProps={uploadProps}
                uploadType={uploadType}
                uploadUrl={uploadUrl}
              />
            }
            title={t("Asset")}
          />
          <AssetListTable
            assetList={assetList}
            columns={columns}
            deleteLoading={deleteLoading}
            hasDeleteRight={hasDeleteRight}
            loading={loading}
            onAssetDelete={onAssetDelete}
            onAssetDownload={onAssetDownload}
            onAssetItemSelect={onAssetItemSelect}
            onAssetSelect={onAssetSelect}
            onAssetsReload={onAssetsReload}
            onAssetTableChange={onAssetTableChange}
            onColumnsChange={onColumnsChange}
            onEdit={onEdit}
            onSearchTerm={onSearchTerm}
            onSelect={onSelect}
            page={page}
            pageSize={pageSize}
            searchTerm={searchTerm}
            selectedAsset={selectedAsset}
            selection={selection}
            sort={sort}
            totalCount={totalCount}
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
