import { useApolloClient } from "@apollo/client";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth-cms/auth";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import {
  useGetAssetsQuery,
  useCreateAssetMutation,
  Maybe,
  User,
  GetAssetsQuery,
  useDeleteAssetMutation,
  AssetSortType as GQLSortType,
  useGetUserBySearchQuery,
} from "@reearth-cms/gql/graphql-client-api";

export type AssetNode = NonNullable<Asset>;
export type AssetUser = Maybe<User>;

export type AssetNodes = NonNullable<GetAssetsQuery["assets"]["nodes"][number]>[];

export type AssetSortType = "date" | "name" | "size";

const enumTypeMapper: Partial<Record<GQLSortType, string>> = {
  [GQLSortType.Date]: "date",
  [GQLSortType.Name]: "name",
  [GQLSortType.Size]: "size",
};

function toGQLEnum(val?: AssetSortType) {
  if (!val) return;
  return (Object.keys(enumTypeMapper) as GQLSortType[]).find(k => enumTypeMapper[k] === val);
}

const assetsPerPage = 20;

function pagination(
  sort?: { type?: Maybe<AssetSortType>; reverse?: boolean },
  endCursor?: string | null,
) {
  const reverseOrder = !sort?.type || sort?.type === "date" ? !sort?.reverse : !!sort?.reverse;

  return {
    after: !reverseOrder ? endCursor : undefined,
    before: reverseOrder ? endCursor : undefined,
    first: !reverseOrder ? assetsPerPage : undefined,
    last: reverseOrder ? assetsPerPage : undefined,
  };
}

export default (projectId?: string) => {
  const navigate = useNavigate();
  const [assetList, setAssetList] = useState<AssetNode[]>([]);
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
      sort: toGQLEnum(sort?.type),
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
              alert("Failed to add one or more assets.");
            }
          }),
        );
        if (results) {
          // TODO: notification
          alert("Successfully added one or more assets.");
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
              alert("Failed to delete one or more assets.");
            }
          }),
        );
        if (results) {
          // TODO: notification
          alert("One or more assets were successfully deleted.");
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
        sort: toGQLEnum(sort?.type),
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
    const assets = (data?.assets.nodes as AssetNode[]) ?? [];
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
