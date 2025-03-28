import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import LinkAssetModal from "@reearth-cms/components/molecules/Common/LinkAssetModal/LinkAssetModal";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace, useProject, useUserRights } from "@reearth-cms/state";

export type AssetProps = {
  onAssetGet: (assetId: string) => Promise<string | undefined>;
  itemAssets?: ItemAsset[];
  assets?: Asset[];
  loadingAssets?: boolean;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onAssetTableChange?: (page: number, pageSize: number, sorter?: SortType) => void;
  onAssetsCreate?: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl?: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsGet?: () => void;
  onAssetsReload?: () => void;
  onAssetSearchTerm?: (term: string) => void;
};

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
} & AssetProps;

const AssetItem: React.FC<Props> = ({
  value,
  onChange,
  disabled,
  onAssetGet,
  itemAssets,
  assets,
  loadingAssets,
  totalCount,
  page,
  pageSize,
  onAssetTableChange,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsGet,
  onAssetsReload,
  onAssetSearchTerm,
}) => {
  const t = useT();

  const [currentWorkspace] = useWorkspace();
  const [currentProject] = useProject();
  const [userRights] = useUserRights();
  const hasCreateRight = useMemo(() => !!userRights?.asset.create, [userRights?.asset.create]);

  const [visible, setVisible] = useState(false);
  const handleClick = useCallback(() => {
    setVisible(true);
    onAssetsGet?.();
  }, [onAssetsGet]);

  const handleLinkAssetModalCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);
  const [asset, setAsset] = useState<ItemAsset>();
  const assetInfosRef = useRef<ItemAsset[]>(itemAssets ?? []);

  const defaultValueGet = useCallback(async () => {
    if (value) {
      const fileName = await onAssetGet(value);
      if (fileName) setAsset({ id: value, fileName });
    } else {
      setAsset(undefined);
    }
  }, [onAssetGet, value]);

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

  const handleLink = useCallback(
    (assetId: string) => {
      onChange?.(assetId);
      setVisible(false);
    },
    [onChange],
  );

  const onUnlink = useCallback(() => {
    onChange?.("");
  }, [onChange]);

  useEffect(() => {
    if (Array.isArray(value)) onChange?.("");
  }, [onChange, value]);

  return (
    <AssetWrapper>
      {value ? (
        <>
          <AssetDetailsWrapper>
            <AssetButton enabled={!!asset} disabled={disabled} onClick={handleClick}>
              <Icon icon="folder" size={24} />
              <AssetName>{asset?.fileName ?? value}</AssetName>
            </AssetButton>
            <Tooltip title={asset?.fileName}>
              {asset ? (
                <Link
                  to={`/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/asset/${value}`}
                  target="_blank">
                  <AssetLinkedName type="link">{asset.fileName}</AssetLinkedName>
                </Link>
              ) : (
                <AssetLinkedName type="link" disabled>
                  {`${value} (removed)`}
                </AssetLinkedName>
              )}
            </Tooltip>
          </AssetDetailsWrapper>
          <Space />
          {asset && !disabled && (
            <Link
              to={`/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/asset/${value}`}
              target="_blank">
              <AssetLink
                color="default"
                variant="link"
                icon={<Icon icon="arrowSquareOut" size={20} />}
              />
            </Link>
          )}
          {value && !disabled && (
            <AssetLink
              color="default"
              variant="link"
              icon={<Icon icon={"unlinkSolid"} size={16} />}
              onClick={onUnlink}
            />
          )}
        </>
      ) : (
        <AssetButton disabled={disabled} onClick={handleClick}>
          <Icon icon="linkSolid" size={14} />
          <AssetButtonTitle>{t("Asset")}</AssetButtonTitle>
        </AssetButton>
      )}
      {onAssetsCreate && onAssetCreateFromUrl && (
        <LinkAssetModal
          visible={visible}
          onLinkAssetModalCancel={handleLinkAssetModalCancel}
          linkedAsset={asset}
          assets={assets}
          loading={loadingAssets}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          hasCreateRight={hasCreateRight}
          onAssetTableChange={onAssetTableChange}
          onChange={onChange}
          onSelect={onSelect}
          onAssetsReload={onAssetsReload}
          onSearchTerm={onAssetSearchTerm}
          onAssetsCreate={onAssetsCreate}
          onAssetCreateFromUrl={onAssetCreateFromUrl}
          onLink={handleLink}
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
