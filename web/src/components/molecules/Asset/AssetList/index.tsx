import styled from "@emotion/styled";
import { useState, useCallback, useMemo } from "react";

import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ColumnsState } from "@reearth-cms/components/atoms/ProTable";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import AssetListTable from "@reearth-cms/components/molecules/Asset/AssetListTable";
import { Asset, AssetItem, SortType } from "@reearth-cms/components/molecules/Asset/types";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import CommentsPanelWrapper, {
  CommentProps,
} from "@reearth-cms/components/molecules/Common/CommentsPanel";
import { useT } from "@reearth-cms/i18n";

export type UploadType = "local" | "url";

type Props = {
  userId: string;
  assets: Asset[];
  loading: boolean;
  deleteLoading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  sort?: SortType;
  searchTerm: string;
  columns: Record<string, ColumnsState>;
  hasCreateRight: boolean;
  hasDeleteRight: boolean | null;
  onColumnsChange: (cols: Record<string, ColumnsState>) => void;
  onAssetItemSelect: (item: AssetItem) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetDelete: (assetIds: string[]) => Promise<void>;
  onSearchTerm: (term: string) => void;
  onNavigateToAsset: (assetId: string) => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  commentProps: CommentProps;
};

const AssetList: React.FC<Props> = ({
  userId,
  assets,
  loading,
  deleteLoading,
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
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetDelete,
  onSearchTerm,
  onNavigateToAsset,
  onAssetsReload,
  onAssetTableChange,
  commentProps,
}) => {
  const t = useT();
  const [collapsed, setCollapsed] = useState(true);
  const handleToggleCommentMenu = useCallback(
    (value: boolean) => {
      setCollapsed(value);
    },
    [setCollapsed],
  );
  const [selectedAssetId, setSelectedAssetId] = useState<string>();

  const selectedAsset = useMemo(
    () => assets.find(asset => asset.id === selectedAssetId),
    [assets, selectedAssetId],
  );

  const handleAssetSelect = useCallback(
    (id: string) => {
      setSelectedAssetId(id);
      setCollapsed(false);
    },
    [setCollapsed, setSelectedAssetId],
  );

  return (
    <ComplexInnerContents
      center={
        <Wrapper>
          <StyledPageHeader
            title={t("Asset")}
            extra={
              <UploadAsset
                hasCreateRight={hasCreateRight}
                onAssetsCreate={onAssetsCreate}
                onAssetCreateFromUrl={onAssetCreateFromUrl}
              />
            }
          />
          <AssetListTable
            userId={userId}
            assets={assets}
            loading={loading}
            deleteLoading={deleteLoading}
            selectedAssetId={selectedAsset?.id ?? ""}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            sort={sort}
            searchTerm={searchTerm}
            columns={columns}
            hasDeleteRight={hasDeleteRight}
            onColumnsChange={onColumnsChange}
            onAssetItemSelect={onAssetItemSelect}
            onAssetSelect={handleAssetSelect}
            onNavigateToAsset={onNavigateToAsset}
            onSearchTerm={onSearchTerm}
            onAssetsReload={onAssetsReload}
            onAssetDelete={onAssetDelete}
            onAssetTableChange={onAssetTableChange}
          />
        </Wrapper>
      }
      right={
        <CommentsPanelWrapper
          userId={userId}
          resourceId={selectedAsset?.id}
          collapsed={collapsed}
          onCollapse={handleToggleCommentMenu}
          comments={selectedAsset?.comments}
          threadId={selectedAsset?.threadId}
          {...commentProps}
        />
      }
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
