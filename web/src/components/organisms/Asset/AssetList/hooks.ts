import { useEffect, useState, useCallback, Key, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { convertAsset } from "@reearth-cms/components/organisms/Asset/convertAsset";
import {
  useGetAssetsQuery,
  useCreateAssetMutation,
  useDeleteAssetMutation,
  Asset as GQLAsset,
  SortDirection as GQLSortDirection,
  AssetSortType as GQLSortType,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

export type AssetSortType = "DATE" | "NAME" | "SIZE";
export type SortDirection = "ASC" | "DESC";
type UploadType = "local" | "url";

export default () => {
  const t = useT();
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [selection, setSelection] = useState<{ selectedRowKeys: Key[] }>({
    selectedRowKeys: [],
  });
  const [selectedAssetId, setSelectedAssetId] = useState<string>();
  const [fileList, setFileList] = useState<UploadFile<File>[]>([]);
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const [uploadType, setUploadType] = useState<UploadType>("local");
  const [uploading, setUploading] = useState(false);
  const [uploadModalVisibility, setUploadModalVisibility] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [createAssetMutation] = useCreateAssetMutation();

  const [sort, setSort] = useState<{ type?: AssetSortType; direction?: SortDirection } | undefined>(
    {
      type: "DATE",
      direction: "DESC",
    },
  );
  const [searchTerm, setSearchTerm] = useState<string>();

  const { data, refetch, loading, networkStatus } = useGetAssetsQuery({
    fetchPolicy: "no-cache",
    variables: {
      projectId: projectId ?? "",
      pagination: { first: pageSize, offset: (page - 1) * pageSize },
      sort: sort
        ? { sortBy: sort.type as GQLSortType, direction: sort.direction as GQLSortDirection }
        : undefined,
      keyword: searchTerm,
      withFiles: false,
    },
    notifyOnNetworkStatusChange: true,
    skip: !projectId,
  });

  const isRefetching = networkStatus === 3;
  const [selectedAssets, selectAsset] = useState<Asset[]>([]);

  const handleUploadModalCancel = useCallback(() => {
    setUploadModalVisibility(false);
    setUploading(false);
    setFileList([]);
    setUploadUrl("");
    setUploadType("local");
  }, [setUploadModalVisibility, setUploading, setFileList, setUploadUrl, setUploadType]);

  const handleAssetsCreate = useCallback(
    (files: UploadFile<File>[]) =>
      (async () => {
        if (!projectId) return [];
        setUploading(true);
        const results = (
          await Promise.all(
            files.map(async file => {
              const result = await createAssetMutation({
                variables: { projectId, file, withFiles: false },
              });
              if (result.errors || !result.data?.createAsset) {
                Notification.error({ message: t("Failed to add one or more assets.") });
                handleUploadModalCancel();
                return undefined;
              }
              return convertAsset(result.data.createAsset.asset as GQLAsset);
            }),
          )
        ).filter(Boolean);
        if (results?.length > 0) {
          Notification.success({ message: t("Successfully added one or more assets!") });
          await refetch();
        }
        handleUploadModalCancel();
        return results;
      })(),
    [projectId, handleUploadModalCancel, createAssetMutation, t, refetch],
  );

  const handleAssetCreateFromUrl = useCallback(
    async (url: string) => {
      if (!projectId) return undefined;
      setUploading(true);
      try {
        const result = await createAssetMutation({
          variables: { projectId, file: null, url, withFiles: false },
        });
        if (result.data?.createAsset) {
          Notification.success({ message: t("Successfully added asset!") });
          await refetch();
          return convertAsset(result.data.createAsset.asset as GQLAsset);
        }
        return undefined;
      } catch {
        Notification.error({ message: t("Failed to add asset.") });
      } finally {
        handleUploadModalCancel();
      }
    },
    [projectId, createAssetMutation, t, refetch, handleUploadModalCancel],
  );

  const [deleteAssetMutation] = useDeleteAssetMutation();
  const handleAssetDelete = useCallback(
    (assetIds: string[]) =>
      (async () => {
        if (!projectId) return;
        const results = await Promise.all(
          assetIds.map(async assetId => {
            const result = await deleteAssetMutation({
              variables: { assetId },
              refetchQueries: ["GetAssets"],
            });
            if (result.errors) {
              Notification.error({ message: t("Failed to delete one or more assets.") });
            }
          }),
        );
        if (results) {
          Notification.success({ message: t("One or more assets were successfully deleted!") });
          selectAsset([]);
        }
      })(),
    [t, deleteAssetMutation, projectId],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term);
  }, []);

  const handleAssetsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleNavigateToAsset = (asset: Asset) => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/asset/${asset.id}`);
  };

  useEffect(() => {
    const assets =
      (data?.assets.nodes
        .map(asset => asset as GQLAsset)
        .map(convertAsset)
        .filter(asset => !!asset) as Asset[]) ?? [];
    setAssetList(assets);
  }, [data?.assets.nodes]);

  const handleAssetSelect = useCallback(
    (id: string) => {
      setSelectedAssetId(id);
      setCollapsed(false);
    },
    [setCollapsed, setSelectedAssetId],
  );

  const handleToggleCommentMenu = useCallback(
    (value: boolean) => {
      setCollapsed(value);
    },
    [setCollapsed],
  );

  const selectedAsset = useMemo(
    () => assetList.find(asset => asset.id === selectedAssetId),
    [assetList, selectedAssetId],
  );

  const handleAssetTableChange = useCallback(
    (
      page: number,
      pageSize: number,
      sorter?: { type?: AssetSortType; direction?: SortDirection },
    ) => {
      setPage(page);
      setPageSize(pageSize);
      setSort(sorter);
    },
    [],
  );

  return {
    assetList,
    selection,
    fileList,
    uploading,
    isLoading: loading ?? isRefetching,
    selectedAssets,
    uploadModalVisibility,
    loading,
    uploadUrl,
    uploadType,
    selectedAsset,
    collapsed,
    totalCount: data?.assets.totalCount ?? 0,
    page,
    pageSize,
    handleToggleCommentMenu,
    handleAssetSelect,
    handleUploadModalCancel,
    setUploadUrl,
    setUploadType,
    setSelection,
    setFileList,
    setUploading,
    setUploadModalVisibility,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleAssetTableChange,
    handleAssetDelete,
    handleSearchTerm,
    handleAssetsReload,
    handleNavigateToAsset,
  };
};
