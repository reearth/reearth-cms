import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { ColumnsState } from "@reearth-cms/components/atoms/ProTable";
import { UploadFile as RawUploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset, AssetItem, SortType } from "@reearth-cms/components/molecules/Asset/types";
import { fromGraphQLAsset } from "@reearth-cms/components/organisms/DataConverters/content";
import {
  useGetAssetsLazyQuery,
  useCreateAssetMutation,
  useDeleteAssetsMutation,
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

type UploadFile = File & {
  skipDecompression?: boolean;
};

export default (isItemsRequired: boolean) => {
  const t = useT();
  const [userRights] = useUserRights();
  const [userId] = useUserId();
  const hasCreateRight = useMemo(() => !!userRights?.asset.create, [userRights?.asset.create]);
  const hasDeleteRight = useMemo(
    () => (userRights ? userRights.asset.delete : false),
    [userRights],
  );
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
  const [page, setPage] = useState(location.state?.page ?? 1);
  const [pageSize, setPageSize] = useState(location.state?.pageSize ?? 10);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm ?? "");
  const [sort, setSort] = useState(location.state?.sort);
  const [columns, setColumns] = useState<Record<string, ColumnsState>>(
    location.state?.columns ?? {},
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
  };
  const [createAssetMutation] = useCreateAssetMutation();
  const [createAssetUploadMutation] = useCreateAssetUploadMutation();
  const [getAssets, { data, refetch, loading }] = isItemsRequired
    ? useGetAssetsItemsLazyQuery(params)
    : useGetAssetsLazyQuery(params);

  useEffect(() => {
    if (isItemsRequired) {
      getAssets();
    }
  }, [getAssets, isItemsRequired]);

  const assets = useMemo(
    () =>
      (data?.assets.nodes
        .map(asset => fromGraphQLAsset(asset as GQLAsset))
        .filter(asset => !!asset) as Asset[]) ?? [],
    [data?.assets.nodes],
  );

  const handleAssetsCreate = useCallback(
    async (files: RawUploadFile[]) => {
      if (!projectId) return [];
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
          Notification.success({ message: t("Successfully added one or more assets!") });
          await refetch();
        }
      } catch (e) {
        console.error("upload error", e);
        Notification.error({ message: t("Failed to add one or more assets.") });
        throw new Error();
      }

      return results;
    },
    [projectId, createAssetMutation, createAssetUploadMutation, t, refetch],
  );

  const handleAssetCreateFromUrl = useCallback(
    async (url: string, autoUnzip: boolean) => {
      if (!projectId) return undefined;
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
          Notification.success({ message: t("Successfully added asset!") });
          await refetch();
          return fromGraphQLAsset(result.data.createAsset.asset as GQLAsset);
        }
      } catch {
        Notification.error({ message: t("Failed to add asset.") });
        throw new Error();
      }
    },
    [projectId, createAssetMutation, t, refetch],
  );

  const [deleteAssetsMutation, { loading: deleteLoading }] = useDeleteAssetsMutation();
  const handleAssetDelete = useCallback(
    async (assetIds: string[]) => {
      if (!projectId) return;
      try {
        const result = await deleteAssetsMutation({
          variables: { assetIds },
        });
        if (result.errors) {
          throw new Error();
        } else {
          await refetch();
          Notification.success({ message: t("One or more assets were successfully deleted!") });
        }
      } catch (e) {
        Notification.error({ message: t("Failed to delete one or more assets.") });
        throw e;
      }
    },
    [t, deleteAssetsMutation, refetch, projectId],
  );

  const handleSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

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

  const handleAssetItemSelect = useCallback(
    (assetItem: AssetItem) => {
      navigate(
        `/workspace/${workspaceId}/project/${projectId}/content/${assetItem.modelId}/details/${assetItem.itemId}`,
      );
    },
    [navigate, projectId, workspaceId],
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

  const handleAssetsGet = useCallback(() => {
    getAssets();
  }, [getAssets]);

  const [getAsset] = useGetAssetLazyQuery();
  const handleAssetGet = useCallback(
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

  return {
    userId: userId ?? "",
    hasCreateRight,
    hasDeleteRight,
    assets,
    loading,
    deleteLoading,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleSearchTerm,
    handleAssetsReload,
    handleAssetDelete,
    handleNavigateToAsset,
    handleAssetItemSelect,
    totalCount: data?.assets.totalCount ?? 0,
    page,
    pageSize,
    sort,
    searchTerm,
    columns,
    handleColumnsChange,
    handleAssetTableChange,
    handleAssetsGet,
    handleAssetGet,
  };
};
