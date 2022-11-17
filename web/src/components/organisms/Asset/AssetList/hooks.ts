import { useApolloClient } from "@apollo/client";
import { useEffect, useState, useCallback, Key } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { convertAsset } from "@reearth-cms/components/organisms/Asset/convertAsset";
import {
  useGetAssetsQuery,
  useCreateAssetMutation,
  Maybe,
  useDeleteAssetMutation,
  Asset as GQLAsset,
  AssetSortType as GQLSortType,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

type AssetSortType = "date" | "name" | "size";

const assetsPerPage = 10;
// Todo: this is temporary until implementing cursor pagination
const assetsFetchCount = 500;

function pagination(
  sort?: { type?: Maybe<AssetSortType>; reverse?: boolean },
  endCursor?: string | null,
) {
  const reverseOrder = !sort?.type || sort?.type === "date" ? !sort?.reverse : !!sort?.reverse;

  return {
    after: !reverseOrder ? endCursor : undefined,
    before: reverseOrder ? endCursor : undefined,
    first: !reverseOrder ? assetsFetchCount : undefined,
    last: reverseOrder ? assetsFetchCount : undefined,
  };
}

export default () => {
  const t = useT();
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [selection, setSelection] = useState<{ selectedRowKeys: Key[] }>({
    selectedRowKeys: [],
  });
  const [fileList, setFileList] = useState<UploadFile<File>[]>([]);
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadModalVisibility, setUploadModalVisibility] = useState(false);
  const [createAssetMutation] = useCreateAssetMutation();

  const [sort, setSort] = useState<{ type?: AssetSortType; reverse?: boolean }>();
  const [searchTerm, setSearchTerm] = useState<string>();
  const gqlCache = useApolloClient().cache;

  const { data, refetch, loading, fetchMore, networkStatus } = useGetAssetsQuery({
    variables: {
      projectId: projectId ?? "",
      pagination: pagination(sort),
      sort: sort?.type as GQLSortType,
      keyword: searchTerm,
    },
    notifyOnNetworkStatusChange: true,
    skip: !projectId,
  });

  const hasMoreAssets =
    data?.assets.pageInfo?.hasNextPage || data?.assets.pageInfo?.hasPreviousPage;

  const isRefetching = networkStatus === 3;
  const [selectedAssets, selectAsset] = useState<Asset[]>([]);

  const handleGetMoreAssets = useCallback(() => {
    if (hasMoreAssets) {
      fetchMore({
        variables: {
          pagination: pagination(sort, data?.assets.pageInfo.endCursor),
        },
      });
    }
  }, [data?.assets.pageInfo, sort, fetchMore, hasMoreAssets]);

  const handleAssetCreate = useCallback(
    (files: UploadFile<File>[]) =>
      (async () => {
        if (!projectId) return;
        const results = await Promise.all(
          files.map(async file => {
            const result = await createAssetMutation({
              variables: { projectId, file },
            });
            if (result.errors || !result.data?.createAsset) {
              Notification.error({ message: t("Failed to add one or more assets.") });
            }
          }),
        );
        if (results) {
          Notification.success({ message: t("Successfully added one or more assets!") });
          await refetch();
        }
      })(),
    [t, projectId, createAssetMutation, refetch],
  );

  const handleAssetCreateFromUrl = useCallback(
    (url: string) =>
      (async () => {
        if (!projectId) return;
        const result = await createAssetMutation({
          variables: { projectId, file: null, url },
        });
        if (result.errors || !result.data?.createAsset) {
          Notification.error({ message: t("Failed to add one or more assets.") });
          return;
        }
        if (result.data?.createAsset) {
          Notification.success({ message: t("Successfully added one or more assets!") });
          await refetch();
          return convertAsset(result.data.createAsset.asset as GQLAsset);
        }
      })(),
    [t, projectId, createAssetMutation, refetch],
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

  const handleSortChange = useCallback(
    (type?: string, reverse?: boolean) => {
      if (!type && reverse === undefined) return;
      setSort({
        type: (type as AssetSortType) ?? sort?.type,
        reverse: !!reverse,
      });
    },
    [sort],
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
    if (sort || searchTerm) {
      selectAsset([]);
      refetch({
        sort: sort?.type as GQLSortType,
        keyword: searchTerm,
      });
    }
  }, [sort, searchTerm, refetch]);

  useEffect(() => {
    return () => {
      setSort(undefined);
      setSearchTerm(undefined);
      gqlCache.evict({ fieldName: "assets" });
    };
  }, [gqlCache]);

  useEffect(() => {
    const assets =
      (data?.assets.nodes
        .map(asset => asset as GQLAsset)
        .map(convertAsset)
        .filter(asset => !!asset) as Asset[]) ?? [];
    setAssetList(assets);
  }, [data?.assets.nodes]);

  return {
    assetList,
    assetsPerPage,
    selection,
    fileList,
    uploadUrl,
    uploading,
    isLoading: loading ?? isRefetching,
    selectedAssets,
    uploadModalVisibility,
    loading,
    setSelection,
    setFileList,
    setUploadUrl,
    setUploading,
    setUploadModalVisibility,
    handleAssetCreate,
    handleAssetCreateFromUrl,
    handleAssetDelete,
    handleGetMoreAssets,
    handleSortChange,
    handleSearchTerm,
    handleAssetsReload,
    handleNavigateToAsset,
  };
};
