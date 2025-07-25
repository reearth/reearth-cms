import fileDownload from "js-file-download";
import { useState, useCallback, Key, useMemo, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { ColumnsState } from "@reearth-cms/components/atoms/ProTable";
import { UploadFile as RawUploadFile, RcFile } from "@reearth-cms/components/atoms/Upload";
import { Asset, AssetItem, SortType } from "@reearth-cms/components/molecules/Asset/types";
import { CreateFieldInput } from "@reearth-cms/components/molecules/Schema/types";
import { fromGraphQLAsset } from "@reearth-cms/components/organisms/DataConverters/content";
import {
  convertFieldType,
  defaultTypePropertyGet,
} from "@reearth-cms/components/organisms/Project/Schema/helpers";
import { useAuthHeader } from "@reearth-cms/gql";
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
  ContentTypesEnum,
  useGuessSchemaFieldsQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useUserId, useUserRights } from "@reearth-cms/state";

import { uploadFiles } from "./upload";

type UploadType = "local" | "url";

type UploadFile = RcFile & {
  skipDecompression?: boolean;
};

export default (isItemsRequired: boolean, limitToGeoJsonAndJson: boolean) => {
  const t = useT();
  const [userRights] = useUserRights();
  const [userId] = useUserId();
  const hasCreateRight = useMemo(() => !!userRights?.asset.create, [userRights?.asset.create]);
  const [hasDeleteRight, setHasDeleteRight] = useState(false);
  const [uploadModalVisibility, setUploadModalVisibility] = useState(false);
  const [importSchemaModalVisibility, setImportSchemaModalVisibility] = useState(false);
  const [selectFileModalVisibility, setSelectFileModalVisibility] = useState(false);
  const [importFields, setImportFields] = useState<CreateFieldInput[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentTypesEnum[]>([]);

  const { workspaceId, projectId, modelId } = useParams();
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
      contentTypes: contentTypes,
    },
    notifyOnNetworkStatusChange: true,
    skip: !projectId,
  };

  const [getAssets, { data, refetch, loading }] = isItemsRequired
    ? useGetAssetsItemsLazyQuery(params)
    : useGetAssetsLazyQuery(params);

  useEffect(() => {
    setContentTypes(limitToGeoJsonAndJson ? [ContentTypesEnum.Geojson, ContentTypesEnum.Json] : []);
  }, [limitToGeoJsonAndJson]);

  useEffect(() => {
    if (isItemsRequired || limitToGeoJsonAndJson) {
      getAssets();
    }
  }, [getAssets, isItemsRequired, limitToGeoJsonAndJson]);

  const {
    data: guessSchemaFieldsData,
    loading: guessSchemaFieldsLoading,
    error: guessSchemaFieldsError,
  } = useGuessSchemaFieldsQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      modelId: modelId ?? "",
      assetId: selectedAssetId ?? "",
    },
    skip: !modelId || !selectedAssetId,
  });

  const parsedFields = useMemo(() => {
    const fields = guessSchemaFieldsData?.guessSchemaFields?.fields;
    if (!fields || fields.length === 0) return [];
    return fields.map(field => ({
      title: field.name,
      metadata: false,
      description: "",
      key: field.name,
      multiple: false,
      unique: false,
      isTitle: false,
      required: false,
      type: convertFieldType(field.type),
      modelId: modelId,
      groupId: undefined,
      typeProperty: defaultTypePropertyGet(field.type),
    }));
  }, [guessSchemaFieldsData, modelId]);

  useEffect(() => {
    setImportFields(parsedFields);
  }, [parsedFields]);

  const assetList = useMemo(
    () =>
      (data?.assets.nodes
        .map(asset => fromGraphQLAsset(asset as GQLAsset))
        .filter(asset => !!asset) as Asset[]) ?? [],
    [data?.assets.nodes],
  );

  const handleUploadModalOpen = useCallback(() => {
    setUploadModalVisibility(true);
  }, [setUploadModalVisibility]);

  const handleSelectFileModalOpen = useCallback(() => {
    setSelectFileModalVisibility(true);
  }, []);

  const handleSchemaImportModalOpen = useCallback(async () => {
    setImportSchemaModalVisibility(true);
  }, []);

  const handleUploadModalCancel = useCallback(() => {
    setUploadModalVisibility(false);
    setFileList([]);
    setUploadUrl({ url: "", autoUnzip: true });
    setUploadType("local");
  }, []);

  const handleSelectFileModalCancel = useCallback(() => {
    setSelectFileModalVisibility(false);
    setSearchTerm("");
    setPage(1);
    setSort(undefined);
    handleUploadModalCancel();
  }, [handleUploadModalCancel]);

  const handleAssetSelect = useCallback(
    (id?: string) => {
      setSelectedAssetId(id);
      setCollapsed(false);
    },
    [setCollapsed, setSelectedAssetId],
  );

  const handleSchemaImportModalCancel = useCallback(() => {
    setImportSchemaModalVisibility(false);
    handleAssetSelect(undefined);
    setImportFields([]);
    setSelectedAssetId(undefined);
    handleUploadModalCancel();
  }, [handleAssetSelect, handleUploadModalCancel]);

  const handleAssetsCreate = useCallback(
    async (files: RawUploadFile[]) => {
      if (!projectId) return [];
      setUploading(true);

      let results: (Asset | undefined)[] = [];

      try {
        results = (
          await uploadFiles<UploadFile, Asset | undefined>(
            files as UploadFile[],
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

  const { getHeader } = useAuthHeader();
  const handleMultipleAssetDownload = async (selected: Asset[]) => {
    if (!selected?.length) return;

    const headers = await getHeader();
    const failedAssets: string[] = [];
    await Promise.allSettled(
      selected.map(async (s: Asset) => {
        try {
          const response = await fetch(s.url, {
            method: "GET",
            ...(s.public ? {} : { headers }),
          });
          if (!response.ok) {
            throw new Error(`Failed to download ${s.fileName}: HTTP ${response.status}`);
          }
          const blob = await response.blob();
          fileDownload(blob, s.fileName);
        } catch (err) {
          console.error("Download error:", err);
          failedAssets.push(s.fileName);
        }
      }),
    );

    if (failedAssets.length === selected.length) {
      Notification.error({
        message: t("All downloads failed"),
        description: failedAssets.join(", "),
      });
    } else if (failedAssets.length > 0) {
      Notification.warning({
        message: t("Some downloads failed"),
        description: t(
          `Success: ${selected.length - failedAssets.length}, Failed: ${failedAssets.join(", ")}`,
        ),
      });
    } else {
      Notification.success({
        message: t("All downloads completed successfully"),
      });
    }
  };

  return {
    importFields,
    guessSchemaFieldsError: !!guessSchemaFieldsError,
    importSchemaModalVisibility,
    selectFileModalVisibility,
    assetList,
    selection,
    fileList,
    uploading,
    guessSchemaFieldsLoading,
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
    handleUploadModalOpen,
    handleSelectFileModalOpen,
    handleSchemaImportModalOpen,
    handleUploadModalCancel,
    handleSelectFileModalCancel,
    handleSchemaImportModalCancel,
    handleColumnsChange,
    handleToggleCommentMenu,
    handleAssetItemSelect,
    handleAssetSelect,
    setUploadUrl,
    setUploadType,
    setImportFields,
    handleSelect,
    setFileList,
    setUploadModalVisibility,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleAssetTableChange,
    handleAssetDelete,
    handleMultipleAssetDownload,
    handleSearchTerm,
    handleAssetsGet,
    handleAssetsReload,
    handleNavigateToAsset,
    handleGetAsset,
  };
};
