import { useState, useCallback, Key, useMemo, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { ColumnsState } from "@reearth-cms/components/atoms/ProTable";
import { UploadFile as RawUploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset, AssetItem, SortType } from "@reearth-cms/components/molecules/Asset/types";
import { fromGraphQLAsset } from "@reearth-cms/components/organisms/DataConverters/content";
import {
  useGetAssetsLazyQuery,
  useCreateAssetMutation,
  useDeleteAssetMutation,
  Asset as GQLAsset,
  SortDirection as GQLSortDirection,
  AssetSortType as GQLSortType,
  useGetAssetsItemsLazyQuery,
  useCreateAssetUploadMutation,
  useGetAssetLazyQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useUserId, useUserRights } from "@reearth-cms/state";

import { uploadFiles } from "./upload";

type UploadType = "local" | "url";

type UploadFile = File & {
  skipDecompression?: boolean;
};

export default (isItemsRequired: boolean) => {
  const t = useT();
  const [userRights] = useUserRights();
  const [userId] = useUserId();
  const hasCreateRight = useMemo(() => !!userRights?.asset.create, [userRights?.asset.create]);
  const [hasDeleteRight, setHasDeleteRight] = useState(false);
  const [uploadModalVisibility, setUploadModalVisibility] = useState(false);

  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const location: {
    state?: {
      searchTerm?: string;
      sort: SortType;
      columns: Record<string, ColumnsState>;
      page: number;
      pageSize: number;
    } | null;
  } = useLocation();
  const [selection, setSelection] = useState<{ selectedRowKeys: Key[] }>({
    selectedRowKeys: [],
  });
  const [selectedAssetId, setSelectedAssetId] = useState<string>();
  const [fileList, setFileList] = useState<RawUploadFile[]>([]);
  const [uploadUrl, setUploadUrl] = useState({
    url: "",
    autoUnzip: true,
  });
  const [uploadType, setUploadType] = useState<UploadType>("local");
  const [collapsed, setCollapsed] = useState(true);
  const [page, setPage] = useState(location.state?.page ?? 1);
  const [pageSize, setPageSize] = useState(location.state?.pageSize ?? 10);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm ?? "");
  const [sort, setSort] = useState(location.state?.sort);
  const [columns, setColumns] = useState<Record<string, ColumnsState>>(
    location.state?.columns ?? {},
  );

  const [uploading, setUploading] = useState(false);
  const [createAssetMutation] = useCreateAssetMutation();
  const [createAssetUploadMutation] = useCreateAssetUploadMutation();

  const handleSelect = useCallback(
    (selectedRowKeys: Key[], selectedRows: Asset[]) => {
      setSelection({
        ...selection,
        selectedRowKeys,
      });
      if (userRights?.asset.delete === null) {
        setHasDeleteRight(selectedRows.every(row => row.createdBy.id === userId));
      } else {
        setHasDeleteRight(!!userRights?.asset.delete);
      }
    },
    [selection, userId, userRights?.asset.delete],
  );

  const [getAsset] = useGetAssetLazyQuery();

  const handleGetAsset = useCallback(
    async (assetId: string) => {
      const { data } = await getAsset({
        variables: {
          assetId,
        },
      });
      if (!data?.node || data.node.__typename !== "Asset") return;
      return data.node.fileName;
    },
    [getAsset],
  );

  const params = {
    fetchPolicy: "cache-and-network" as const,
    variables: {
      projectId: projectId ?? "",
      pagination: { first: pageSize, offset: (page - 1) * pageSize },
      sort: sort
        ? {
            sortBy: sort.type as GQLSortType,
            direction: sort.direction as GQLSortDirection,
          }
        : { sortBy: "DATE" as GQLSortType, direction: "DESC" as GQLSortDirection },
      keyword: searchTerm,
    },
    notifyOnNetworkStatusChange: true,
    skip: !projectId,
  };

  const [getAssets, { data, refetch, loading }] = isItemsRequired
    ? useGetAssetsItemsLazyQuery(params)
    : useGetAssetsLazyQuery(params);

  useEffect(() => {
    if (isItemsRequired) {
      getAssets();
    }
  }, [getAssets, isItemsRequired]);

  const assetList = useMemo(
    () =>
      (data?.assets.nodes
        .map(asset => fromGraphQLAsset(asset as GQLAsset))
        .filter(asset => !!asset) as Asset[]) ?? [],
    [data?.assets.nodes],
  );

  const handleUploadModalCancel = useCallback(() => {
    setUploadModalVisibility(false);
    setFileList([]);
    setUploadUrl({ url: "", autoUnzip: true });
    setUploadType("local");
  }, [setUploadModalVisibility, setFileList, setUploadUrl, setUploadType]);

  const handleAssetsCreate = useCallback(
    async (files: RawUploadFile[]) => {
      if (!projectId) return [];
      setUploading(true);

      let results: (Asset | undefined)[] = [];

      try {
        results = (
          await uploadFiles<UploadFile, Asset | undefined>(
            files as unknown as UploadFile[], // TODO: refactor
            async ({ contentLength, contentEncoding, cursor, filename }) => {
              const result = await createAssetUploadMutation({
                variables: {
                  projectId,
                  filename,
                  contentLength,
                  contentEncoding,
                  cursor: cursor ?? "",
                },
              });

              if (result.errors || !result.data?.createAssetUpload) {
                Notification.error({ message: t("Failed to add one or more assets.") });
                handleUploadModalCancel();
                return undefined;
              }

              return {
                url: result.data.createAssetUpload.url,
                token: result.data.createAssetUpload.token,
                contentLength: result.data.createAssetUpload.contentLength,
                contentType: result.data.createAssetUpload.contentType ?? "",
                contentEncoding: result.data.createAssetUpload.contentEncoding ?? "",
                next: result.data.createAssetUpload.next ?? "",
              };
            },
            (token, file) => {
              return createAssetMutation({
                variables: {
                  projectId,
                  token,
                  file: token === "" ? file : null,
                  skipDecompression: !!file?.skipDecompression,
                },
              }).then(result => {
                if (result.errors || !result.data?.createAsset) {
                  Notification.error({ message: t("Failed to add one or more assets.") });
                  return undefined;
                }
                return fromGraphQLAsset(result.data.createAsset.asset as GQLAsset);
              });
            },
          )
        ).filter(Boolean);

        if (results?.length > 0) {
          handleUploadModalCancel();
          Notification.success({ message: t("Successfully added one or more assets!") });
          await refetch();
        }
      } catch (e) {
        console.error("upload error", e);
        Notification.error({ message: t("Failed to add one or more assets.") });
      } finally {
        setUploading(false);
      }

      return results;
    },
    [
      projectId,
      handleUploadModalCancel,
      createAssetMutation,
      createAssetUploadMutation,
      t,
      refetch,
    ],
  );

  const handleAssetCreateFromUrl = useCallback(
    async (url: string, autoUnzip: boolean) => {
      if (!projectId) return undefined;
      setUploading(true);
      try {
        const result = await createAssetMutation({
          variables: {
            projectId,
            token: null,
            url,
            skipDecompression: !autoUnzip,
          },
        });
        if (result.data?.createAsset) {
          handleUploadModalCancel();
          Notification.success({ message: t("Successfully added asset!") });
          await refetch();
          return fromGraphQLAsset(result.data.createAsset.asset as GQLAsset);
        }
      } catch {
        Notification.error({ message: t("Failed to add asset.") });
      } finally {
        setUploading(false);
      }
    },
    [projectId, createAssetMutation, t, refetch, handleUploadModalCancel],
  );

  const [deleteAssetMutation, { loading: deleteLoading }] = useDeleteAssetMutation();
  const handleAssetDelete = useCallback(
    async (assetIds: string[]) => {
      if (!projectId) return;
      const results = await Promise.all(
        assetIds.map(async assetId => {
          const result = await deleteAssetMutation({
            variables: { assetId },
          });
          if (result.errors) {
            Notification.error({ message: t("Failed to delete one or more assets.") });
          }
        }),
      );
      if (results) {
        await refetch();
        Notification.success({ message: t("One or more assets were successfully deleted!") });
        setSelection({ selectedRowKeys: [] });
      }
    },
    [t, deleteAssetMutation, refetch, projectId],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term ?? "");
    setPage(1);
  }, []);

  const handleAssetsGet = useCallback(() => {
    getAssets();
  }, [getAssets]);

  const handleAssetsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleNavigateToAsset = useCallback(
    (assetId: string) => {
      navigate(`/workspace/${workspaceId}/project/${projectId}/asset/${assetId}`, {
        state: { searchTerm, sort, columns, page, pageSize },
      });
    },
    [navigate, workspaceId, projectId, searchTerm, sort, columns, page, pageSize],
  );

  const handleAssetSelect = useCallback(
    (id: string) => {
      setSelectedAssetId(id);
      setCollapsed(false);
    },
    [setCollapsed, setSelectedAssetId],
  );

  const handleAssetItemSelect = useCallback(
    (assetItem: AssetItem) => {
      navigate(
        `/workspace/${workspaceId}/project/${projectId}/content/${assetItem.modelId}/details/${assetItem.itemId}`,
      );
    },
    [navigate, projectId, workspaceId],
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
    (page: number, pageSize: number, sorter?: SortType) => {
      setPage(page);
      setPageSize(pageSize);
      setSort(sorter);
    },
    [],
  );

  const handleColumnsChange = useCallback((cols: Record<string, ColumnsState>) => {
    delete cols.EDIT_ICON;
    delete cols.commentsCount;
    setColumns(cols);
  }, []);

  return {
    assetList,
    selection,
    fileList,
    uploading,
    uploadModalVisibility,
    loading,
    deleteLoading,
    uploadUrl,
    uploadType,
    selectedAsset,
    collapsed,
    totalCount: data?.assets.totalCount ?? 0,
    page,
    pageSize,
    sort,
    searchTerm,
    columns,
    hasCreateRight,
    hasDeleteRight,
    handleColumnsChange,
    handleToggleCommentMenu,
    handleAssetItemSelect,
    handleAssetSelect,
    handleUploadModalCancel,
    setUploadUrl,
    setUploadType,
    handleSelect,
    setFileList,
    setUploadModalVisibility,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleAssetTableChange,
    handleAssetDelete,
    handleSearchTerm,
    handleAssetsGet,
    handleAssetsReload,
    handleNavigateToAsset,
    handleGetAsset,
  };
};
