import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { UploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import LinkAssetModal from "@reearth-cms/components/molecules/Common/LinkAssetModal/LinkAssetModal";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

export type AssetProps = {
  assetList?: Asset[];
  fileList?: UploadFile[];
  itemAssets?: ItemAsset[];
  loadingAssets?: boolean;
  onAssetCreateFromUrl?: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsCreate?: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetSearchTerm?: (term?: string | undefined) => void;
  onAssetsGet?: () => void;
  onAssetsReload?: () => void;
  onAssetTableChange?: (page: number, pageSize: number, sorter?: SortType) => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onUploadModalCancel?: () => void;
  page?: number;
  pageSize?: number;
  setFileList?: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility?: (visible: boolean) => void;
  setUploadType?: (type: UploadType) => void;
  setUploadUrl?: (uploadUrl: { autoUnzip: boolean; url: string; }) => void;
  totalCount?: number;
  uploading?: boolean;
  uploadModalVisibility?: boolean;
  uploadType?: UploadType;
  uploadUrl?: { autoUnzip: boolean; url: string; };
};

type Props = {
  disabled?: boolean;
  onChange?: (value: string) => void;
  value?: string;
} & AssetProps;

const AssetItem: React.FC<Props> = ({
  assetList,
  disabled,
  fileList,
  itemAssets,
  loadingAssets,
  onAssetCreateFromUrl,
  onAssetsCreate,
  onAssetSearchTerm,
  onAssetsGet,
  onAssetsReload,
  onAssetTableChange,
  onChange,
  onGetAsset,
  onUploadModalCancel,
  page,
  pageSize,
  setFileList,
  setUploadModalVisibility,
  setUploadType,
  setUploadUrl,
  totalCount,
  uploading,
  uploadModalVisibility,
  uploadType,
  uploadUrl,
  value,
}) => {
  const t = useT();
  const {
    displayUploadModal,
    handleClick,
    handleLinkAssetModalCancel,
    handleUploadAndLink,
    hasCreateRight,
    projectId,
    visible,
    workspaceId,
  } = useHooks(
    fileList,
    uploadUrl,
    uploadType,
    onAssetsCreate,
    onAssetCreateFromUrl,
    setUploadModalVisibility,
    onAssetsGet,
    onChange,
  );
  const [asset, setAsset] = useState<ItemAsset>();
  const assetInfosRef = useRef<ItemAsset[]>(itemAssets ?? []);

  const defaultValueGet = useCallback(async () => {
    if (value) {
      const fileName = await onGetAsset(value);
      if (fileName) setAsset({ fileName, id: value });
    } else {
      setAsset(undefined);
    }
  }, [onGetAsset, value]);

  useEffect(() => {
    if (loadingAssets) return;
    const assetInfo = assetInfosRef.current.find(itemAsset => itemAsset.id === value);
    if (assetInfo) {
      setAsset(assetInfo);
    } else {
      defaultValueGet();
    }
  }, [defaultValueGet, loadingAssets, value]);

  const onSelect = useCallback((selectedAsset: ItemAsset) => {
    if (selectedAsset) assetInfosRef.current.push(selectedAsset);
  }, []);

  const onUnlink = useCallback(() => {
    onChange?.("");
  }, [onChange]);

  const uploadProps: UploadProps = {
    accept: "*",
    beforeUpload: file => {
      setFileList?.([file]);
      return false;
    },
    directory: false,
    fileList,
    listType: "picture",
    maxCount: 1,
    multiple: false,
    name: "file",
    onRemove: () => {
      setFileList?.([]);
    },
    showUploadList: true,
  };

  useEffect(() => {
    if (Array.isArray(value)) onChange?.("");
  }, [onChange, value]);

  return (
    <AssetWrapper>
      {value ? (
        <>
          <AssetDetailsWrapper>
            <AssetButton disabled={disabled} enabled={!!asset} onClick={handleClick}>
              <Icon icon="folder" size={24} />
              <AssetName>{asset?.fileName ?? value}</AssetName>
            </AssetButton>
            <Tooltip title={asset?.fileName}>
              {asset ? (
                <Link
                  target="_blank"
                  to={`/workspace/${workspaceId}/project/${projectId}/asset/${value}`}>
                  <AssetLinkedName type="link">{asset.fileName}</AssetLinkedName>
                </Link>
              ) : (
                <AssetLinkedName disabled type="link">
                  {`${value} (removed)`}
                </AssetLinkedName>
              )}
            </Tooltip>
          </AssetDetailsWrapper>
          <Space />
          {asset && !disabled && (
            <Link
              target="_blank"
              to={`/workspace/${workspaceId}/project/${projectId}/asset/${value}`}>
              <AssetLink
                color="default"
                icon={<Icon icon="arrowSquareOut" size={20} />}
                variant="link"
              />
            </Link>
          )}
          {value && !disabled && (
            <AssetLink
              color="default"
              icon={<Icon icon={"unlinkSolid"} size={16} />}
              onClick={onUnlink}
              variant="link"
            />
          )}
        </>
      ) : (
        <AssetButton disabled={disabled} onClick={handleClick}>
          <Icon icon="linkSolid" size={14} />
          <AssetButtonTitle>{t("Asset")}</AssetButtonTitle>
        </AssetButton>
      )}
      {uploadUrl && setUploadUrl && (
        <LinkAssetModal
          assetList={assetList}
          displayUploadModal={displayUploadModal}
          fileList={fileList}
          hasCreateRight={hasCreateRight}
          linkedAsset={asset}
          loading={loadingAssets}
          onAssetsReload={onAssetsReload}
          onAssetTableChange={onAssetTableChange}
          onChange={onChange}
          onLinkAssetModalCancel={handleLinkAssetModalCancel}
          onSearchTerm={onAssetSearchTerm}
          onSelect={onSelect}
          onUploadAndLink={handleUploadAndLink}
          onUploadModalCancel={onUploadModalCancel}
          page={page}
          pageSize={pageSize}
          setUploadType={setUploadType}
          setUploadUrl={setUploadUrl}
          totalCount={totalCount}
          uploading={uploading}
          uploadModalVisibility={uploadModalVisibility}
          uploadProps={uploadProps}
          uploadType={uploadType}
          uploadUrl={uploadUrl}
          visible={visible}
        />
      )}
    </AssetWrapper>
  );
};

const AssetButton = styled(Button)<{ enabled?: boolean }>`
  width: 100px;
  height: 100px;
  border: 1px dashed;
  border-color: ${({ enabled }) => (enabled ? "#d9d9d9" : "#00000040")};
  color: ${({ enabled }) => (enabled ? "#000000D9" : "#00000040")};
  padding: 0 5px;
  flex-flow: column;
`;

const Space = styled.div`
  flex: 1;
`;

const AssetWrapper = styled.div`
  display: flex;
  align-items: center;
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

const AssetLinkedName = styled(Button)<{ disabled?: boolean }>`
  color: ${({ disabled }) => (disabled ? "#00000040" : "#1890ff")};
  margin-left: 12px;
  span {
    text-align: start;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
  }
`;

const AssetDetailsWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const AssetName = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AssetButtonTitle = styled.div`
  margin-top: 4px;
`;

export default AssetItem;
