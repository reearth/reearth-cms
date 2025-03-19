import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { UploadFile as RawUploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import {
  Asset,
  SortType,
  UploadFile,
} from "@reearth-cms/components/molecules/Asset/types";
import { fromGraphQLAsset } from "@reearth-cms/components/organisms/DataConverters/content";
import { uploadFiles } from "@reearth-cms/components/organisms/Project/Asset/AssetList/upload";
import {
  useGetAssetsQuery,
  SortDirection as GQLSortDirection,
  AssetSortType as GQLSortType,
  Asset as GQLAsset,
  useCreateAssetUploadMutation,
  useCreateAssetMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useUserRights } from "@reearth-cms/state";

import { ItemAsset } from "../Content/types";

export default () => {
  const t = useT();

  const { workspaceId, projectId } = useParams();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<SortType | undefined>();
  const [selectedAsset, setSelectedAsset] = useState<ItemAsset>();

  const [fileList, setFileList] = useState<RawUploadFile[]>([]);
  const [uploadUrl, setUploadUrl] = useState({
    url: "",
    autoUnzip: true,
  });
  const [uploadType, setUploadType] = useState<UploadType>("local");
  const [uploading, setUploading] = useState(false);
  const [uploadModalVisibility, setUploadModalVisibility] = useState(false);

  const [userRights] = useUserRights();
  const hasCreateRight = useMemo(() => !!userRights?.asset.create, [userRights?.asset.create]);

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
  const { data, loading, refetch } = useGetAssetsQuery(params);

  const assetList = useMemo(
    () =>
      (data?.assets.nodes
        .map(asset => fromGraphQLAsset(asset as GQLAsset))
        .filter(asset => !!asset) as Asset[]) ?? [],
    [data?.assets.nodes],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term ?? "");
    setPage(1);
  }, []);

  const handleAssetsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleAssetTableChange = useCallback(
    (page: number, pageSize: number, sorter?: SortType) => {
      setPage(page);
      setPageSize(pageSize);
      setSort(sorter);
    },
    [],
  );

  const handleSelect = useCallback((selectedAsset: ItemAsset) => {
    setSelectedAsset(selectedAsset);
  }, []);

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    directory: false,
    showUploadList: true,
    accept: "*",
    listType: "picture",
    onRemove: () => {
      setFileList?.([]);
    },
    beforeUpload: file => {
      setFileList?.([file]);
      return false;
    },
    fileList,
  };

  const displayUploadModal = useCallback(() => {
    setUploadModalVisibility?.(true);
  }, [setUploadModalVisibility]);

  const handleUploadModalCancel = useCallback(() => {
    setUploadModalVisibility(false);
    setFileList([]);
    setUploadUrl({ url: "", autoUnzip: true });
    setUploadType("local");
  }, [setUploadModalVisibility, setFileList, setUploadUrl, setUploadType]);

  const [createAssetUploadMutation] = useCreateAssetUploadMutation();
  const [createAssetMutation] = useCreateAssetMutation();

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
    [projectId, createAssetMutation, handleUploadModalCancel, t, refetch],
  );

  const handleAssetUpload = useCallback(async () => {
    if (uploadType === "url" && uploadUrl) {
      return (await handleAssetCreateFromUrl?.(uploadUrl.url, uploadUrl.autoUnzip)) ?? undefined;
    } else if (fileList) {
      const assets = await handleAssetsCreate?.(fileList);
      return assets && assets?.length > 0 ? assets[0] : undefined;
    }
  }, [fileList, handleAssetCreateFromUrl, handleAssetsCreate, uploadType, uploadUrl]);

  const handleUploadAndLink = useCallback(async () => {
    const asset = await handleAssetUpload();
    if (asset) handleSelect(asset);
  }, [handleAssetUpload, handleSelect]);

  return {
    workspaceId,
    projectId,
    page,
    pageSize,
    assetList,
    loading,
    selectedAsset,
    uploadProps,
    fileList,
    uploadType,
    uploadUrl,
    uploading,
    setUploadUrl,
    setUploadType,
    uploadModalVisibility,
    totalCount: data?.assets.totalCount ?? 0,
    handleSearchTerm,
    handleAssetsReload,
    handleAssetTableChange,
    handleSelect,
    hasCreateRight,
    handleUploadModalCancel,
    displayUploadModal,
    handleUploadAndLink,
  };
};
