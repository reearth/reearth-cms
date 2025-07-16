import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { ColumnsState } from "@reearth-cms/components/atoms/ProTable";
import { UploadFile as RawUploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import { CreateFieldInput } from "@reearth-cms/components/molecules/Schema/types";
import { fromGraphQLAsset } from "@reearth-cms/components/organisms/DataConverters/content";
import {
  useCreateAssetMutation,
  Asset as GQLAsset,
  SortDirection as GQLSortDirection,
  AssetSortType as GQLSortType,
  useCreateAssetUploadMutation,
  useGuessSchemaFieldsQuery,
  ContentTypesEnum,
  useGetAssetsItemsQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

import { uploadFiles } from "../Asset/AssetList/upload";

import { convertFieldType, defaultTypePropertyGet } from "./helpers";

type UploadType = "local" | "url";

type UploadFile = File & {
  skipDecompression?: boolean;
};

export default () => {
  const t = useT();
  const [uploadModalVisibility, setUploadModalVisibility] = useState(false);

  const { workspaceId, projectId, modelId } = useParams();
  const location: {
    state?: {
      searchTerm?: string;
      sort: SortType;
      columns: Record<string, ColumnsState>;
      page: number;
      pageSize: number;
    } | null;
  } = useLocation();
  const [selectedAssetId, setSelectedAssetId] = useState<string>();
  const [fileList, setFileList] = useState<RawUploadFile[]>([]);
  const [uploadUrl, setUploadUrl] = useState({
    url: "",
    autoUnzip: true,
  });
  const [uploadType, setUploadType] = useState<UploadType>("local");
  const [page, setPage] = useState(location.state?.page ?? 1);
  const [pageSize, setPageSize] = useState(location.state?.pageSize ?? 10);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm ?? "");
  const [sort, setSort] = useState(location.state?.sort);

  const [uploading, setUploading] = useState(false);
  const [createAssetMutation] = useCreateAssetMutation();
  const [createAssetUploadMutation] = useCreateAssetUploadMutation();

  const { data, refetch, loading } = useGetAssetsItemsQuery({
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
      contentTypes: [ContentTypesEnum.Geojson, ContentTypesEnum.Json],
    },
    notifyOnNetworkStatusChange: true,
    skip: !projectId,
  });

  const assetList = useMemo(
    () =>
      (data?.assets.nodes
        .map(asset => fromGraphQLAsset(asset as GQLAsset))
        .filter(asset => !!asset) as Asset[]) ?? [],
    [data?.assets.nodes],
  );

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

  const [importFields, setImportFields] = useState<CreateFieldInput[]>([]);

  useEffect(() => {
    const fields = guessSchemaFieldsData?.guessSchemaFields?.fields;
    if (fields && fields.length > 0) {
      setImportFields(
        fields.map(
          field =>
            ({
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
              groupId: "",
              typeProperty: defaultTypePropertyGet(field.type),
            }) as CreateFieldInput,
        ),
      );
    }
  }, [data, guessSchemaFieldsData?.guessSchemaFields?.fields, modelId]);

  const handleUploadModalCancel = useCallback(() => {
    setUploadModalVisibility(false);
    setFileList([]);
    setImportFields([]);
    setSelectedAssetId(undefined);
    setSearchTerm("");
    setSort(undefined);
    setPage(1);
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

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term ?? "");
    setPage(1);
  }, []);

  const handleAssetsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleAssetSelect = useCallback(
    (id?: string) => {
      setSelectedAssetId(id);
    },
    [setSelectedAssetId],
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

  return {
    workspaceId,
    projectId,
    importFields,
    hasImportSchemaFieldsError: !!guessSchemaFieldsError,
    assetList,
    fileList,
    uploading,
    guessSchemaFieldsLoading,
    uploadModalVisibility,
    loading,
    uploadUrl,
    uploadType,
    selectedAsset,
    totalCount: data?.assets.totalCount ?? 0,
    page,
    pageSize,
    handleAssetSelect,
    handleUploadModalCancel,
    setUploadUrl,
    setUploadType,
    setImportFields,
    setFileList,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleAssetTableChange,
    handleSearchTerm,
    handleAssetsReload,
  };
};
