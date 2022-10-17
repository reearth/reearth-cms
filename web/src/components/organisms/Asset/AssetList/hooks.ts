import { useApolloClient } from "@apollo/client";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth-cms/auth";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { convertAsset } from "@reearth-cms/components/organisms/Asset/convertAsset";
import {
  useGetAssetsQuery,
  useCreateAssetMutation,
  Maybe,
  User,
  useDeleteAssetMutation,
  useGetUserBySearchQuery,
  Asset as GQLAsset,
  AssetSortType as GQLSortType,
} from "@reearth-cms/gql/graphql-client-api";

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

export default (projectId?: string) => {
  const navigate = useNavigate();
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [selection, setSelection] = useState({
    selectedRowKeys: [],
  });
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadModalVisibility, setUploadModalVisibility] = useState(false);
  const [createAssetMutation] = useCreateAssetMutation();

  const [sort, setSort] = useState<{ type?: AssetSortType; reverse?: boolean }>();
  const [searchTerm, setSearchTerm] = useState<string>();
  const gqlCache = useApolloClient().cache;

  const { user } = useAuth();
  const email = user?.email as string;
  const userQuery = useGetUserBySearchQuery({ variables: { nameOrEmail: email } });
  const currentUser = userQuery?.data?.searchUser as User;

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

  const createAssets = useCallback(
    (files: UploadFile<any>[]) =>
      (async () => {
        if (!projectId || !currentUser?.id) return;
        const results = await Promise.all(
          files.map(async file => {
            const result = await createAssetMutation({
              variables: { projectId, createdById: currentUser?.id, file },
            });
            if (result.errors || !result.data?.createAsset) {
              // TODO: notification
              // console.log("Failed to add one or more assets.");
            }
          }),
        );
        if (results) {
          // TODO: notification
          // console.log("Successfully added one or more assets.");
          await refetch();
        }
      })(),
    [projectId, currentUser?.id, createAssetMutation, refetch],
  );

  const [deleteAssetMutation] = useDeleteAssetMutation();
  const deleteAssets = useCallback(
    (assetIds: string[]) =>
      (async () => {
        if (!projectId) return;
        const results = await Promise.all(
          assetIds.map(async assetId => {
            const result = await deleteAssetMutation({
              variables: { assetId },
              refetchQueries: ["GetAssets"],
            });
            if (result.errors || result.data?.deleteAsset) {
              // TODO: notification
              // console.log("Failed to delete one or more assets.");
            }
          }),
        );
        if (results) {
          // TODO: notification
          // console.log("One or more assets were successfully deleted.");
          selectAsset([]);
        }
      })(),
    [deleteAssetMutation, projectId],
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
    currentUser,
    assetList,
    assetsPerPage,
    createAssets,
    deleteAssets,
    navigate,
    selection,
    setSelection,
    fileList,
    setFileList,
    uploading,
    setUploading,
    isLoading: loading ?? isRefetching,
    selectedAssets,
    handleGetMoreAssets,
    handleSortChange,
    handleSearchTerm,
    uploadModalVisibility,
    setUploadModalVisibility,
  };
};
