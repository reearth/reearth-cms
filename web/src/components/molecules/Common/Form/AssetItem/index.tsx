import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import LinkAssetModal from "@reearth-cms/components/molecules/Common/LinkAssetModal/LinkAssetModal";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

type Props = {
  assetList: Asset[];
  fileList: UploadFile[];
  value?: string;
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: string;
  uploadType: UploadType;
  totalCount: number;
  page: number;
  pageSize: number;
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onChange?: (value: string) => void;
  onNavigateToAsset: (asset: Asset) => void;
  disabled?: boolean;
};

const AssetItem: React.FC<Props> = ({
  assetList,
  fileList,
  value,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  totalCount,
  page,
  pageSize,
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
  onChange,
  onNavigateToAsset,
  disabled,
}) => {
  const t = useT();
  const {
    asset,
    visible,
    handleClick,
    handleLinkAssetModalCancel,
    displayUploadModal,
    handleUploadAndLink,
  } = useHooks(
    fileList,
    uploadUrl,
    uploadType,
    onAssetsCreate,
    onAssetCreateFromUrl,
    setUploadModalVisibility,
    onChange,
    value,
  );

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    directory: false,
    showUploadList: true,
    accept: "*",
    listType: "picture",
    onRemove: _file => {
      setFileList([]);
    },
    beforeUpload: file => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <AssetWrapper>
      {asset ? (
        <>
          <AssetDetailsWrapper>
            <AssetButton disabled={disabled} onClick={handleClick}>
              <div>
                <Icon icon="folder" size={24} />
                <div style={{ marginTop: 8, overflow: "hidden" }}>{asset.fileName}</div>
              </div>
            </AssetButton>
            <AssetLinkedName type="link" onClick={() => onNavigateToAsset(asset)}>
              {asset?.fileName}
            </AssetLinkedName>
          </AssetDetailsWrapper>
          <AssetLink
            type="link"
            icon={<Icon icon="arrowSquareOut" size={20} />}
            onClick={() => onNavigateToAsset(asset)}
          />
        </>
      ) : (
        <AssetButton disabled={disabled} onClick={handleClick}>
          <div>
            <Icon icon="linkSolid" size={14} />
            <div style={{ marginTop: 4 }}>{t("Asset")}</div>
          </div>
        </AssetButton>
      )}
      <LinkAssetModal
        visible={visible}
        onLinkAssetModalCancel={handleLinkAssetModalCancel}
        linkedAsset={asset}
        assetList={assetList}
        fileList={fileList}
        loading={loadingAssets}
        uploading={uploading}
        uploadProps={uploadProps}
        uploadModalVisibility={uploadModalVisibility}
        uploadUrl={uploadUrl}
        uploadType={uploadType}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onAssetTableChange={onAssetTableChange}
        setUploadUrl={setUploadUrl}
        setUploadType={setUploadType}
        onChange={onChange}
        onAssetsReload={onAssetsReload}
        onSearchTerm={onAssetSearchTerm}
        displayUploadModal={displayUploadModal}
        onUploadModalCancel={onUploadModalCancel}
        onUploadAndLink={handleUploadAndLink}
      />
    </AssetWrapper>
  );
};

const AssetButton = styled(Button)`
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
`;

const AssetWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const AssetLink = styled(Button)`
  color: #000000d9;
  margin-top: 4px;
  top: 3px;
  &:disabled {
    cursor: pointer;
    pointer-events: auto;
  }
`;

const AssetLinkedName = styled(Button)`
  color: #1890ff;
  margin-left: 12px;
`;

const AssetDetailsWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export default AssetItem;
