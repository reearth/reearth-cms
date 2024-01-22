import moment from "moment";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import {
  FormItem,
  Item,
  ItemValue,
  ItemStatus,
  ItemField,
} from "@reearth-cms/components/molecules/Content/types";
import {
  RequestUpdatePayload,
  RequestState,
} from "@reearth-cms/components/molecules/Request/types";
import { Group, Field } from "@reearth-cms/components/molecules/Schema/types";
import { Member, Role } from "@reearth-cms/components/molecules/Workspace/types";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/hooks";
import { convertItem } from "@reearth-cms/components/organisms/Project/Content/utils";
import { convertModel } from "@reearth-cms/components/organisms/Project/ModelsMenu/convertModel";
import {
  Item as GQLItem,
  Model as GQLModel,
  Group as GQLGroup,
  RequestState as GQLRequestState,
  useCreateItemMutation,
  useCreateRequestMutation,
  useGetItemQuery,
  useGetModelQuery,
  useGetMeQuery,
  useUpdateItemMutation,
  useUpdateRequestMutation,
  useSearchItemQuery,
  useGetItemsByIdsQuery,
  useGetGroupsQuery,
  FieldType as GQLFieldType,
  StringOperator,
  ItemFieldInput,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { newID } from "@reearth-cms/utils/id";
import { fromGraphQLGroup } from "@reearth-cms/utils/values";

export default () => {
  const {
    currentModel,
    currentWorkspace,
    currentProject,
    requests,
    addItemToRequestModalShown,
    handlePublish,
    handleUnpublish,
    handleAddItemToRequest,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleRequestTableChange,
    handleRequestSearchTerm,
    loading,
    totalCount,
    page,
    pageSize,
  } = useContentHooks();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userData } = useGetMeQuery();

  const { itemId, modelId } = useParams();
  const [collapsedModelMenu, collapseModelMenu] = useState(false);
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [requestModalShown, setRequestModalShown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [linkItemModalPage, setLinkItemModalPage] = useState<number>(1);
  const [linkItemModalPageSize, setLinkItemModalPageSize] = useState<number>(10);
  const [referenceModelId, setReferenceModelId] = useState<string | undefined>(modelId);

  const projectId = useMemo(() => currentProject?.id, [currentProject]);
  const titleId = useRef("");

  useEffect(() => {
    setLinkItemModalPage(+linkItemModalPage);
    setLinkItemModalPageSize(+linkItemModalPageSize);
  }, [setLinkItemModalPage, setLinkItemModalPageSize, linkItemModalPage, linkItemModalPageSize]);
  const t = useT();

  const { data, loading: itemLoading } = useGetItemQuery({
    fetchPolicy: "no-cache",
    variables: { id: itemId ?? "" },
    skip: !itemId,
  });

  const { data: modelData } = useGetModelQuery({
    fetchPolicy: "no-cache",
    variables: { id: referenceModelId ?? "" },
    skip: !referenceModelId,
  });
  const model = useMemo(() => convertModel(modelData?.node as GQLModel), [modelData?.node]);
  const { data: itemsData } = useSearchItemQuery({
    fetchPolicy: "no-cache",
    variables: {
      searchItemInput: {
        query: {
          project: currentProject?.id ?? "",
          model: model?.id ?? "",
          schema: model?.schemaId,
        },
        pagination: {
          first: linkItemModalPageSize,
          offset: (linkItemModalPage - 1) * linkItemModalPageSize,
        },
        filter:
          searchTerm && titleId.current
            ? {
                and: {
                  conditions: [
                    {
                      string: {
                        fieldId: { id: titleId.current, type: GQLFieldType.Field },
                        operator: StringOperator.Contains,
                        value: searchTerm,
                      },
                    },
                  ],
                },
              }
            : undefined,
      },
    },
    skip: !model?.id,
  });

  const handleSearchTerm = useCallback(
    (term?: string) => {
      titleId.current = itemsData?.searchItem.nodes[0]?.fields[1]?.schemaFieldId ?? titleId.current;
      setSearchTerm(term ?? "");
      setLinkItemModalPage(1);
    },
    [itemsData?.searchItem.nodes],
  );

  const handleLinkItemTableChange = useCallback((page: number, pageSize: number) => {
    setLinkItemModalPage(page);
    setLinkItemModalPageSize(pageSize);
  }, []);

  const linkedItemsModalList: FormItem[] | undefined = useMemo(() => {
    return itemsData?.searchItem.nodes
      ?.map(item =>
        item
          ? {
              id: item.id,
              schemaId: item.schemaId,
              status: item.status as ItemStatus,
              createdBy: item.createdBy?.name,
              createdAt: item.createdAt,
              title: item.title,
              updatedAt: item.updatedAt,
            }
          : undefined,
      )
      .filter((contentTableField): contentTableField is FormItem => !!contentTableField);
  }, [itemsData?.searchItem.nodes]);

  const me: User | undefined = useMemo(() => {
    return userData?.me
      ? {
          id: userData.me.id,
          name: userData.me.name,
          lang: userData.me.lang,
          email: userData.me.email,
        }
      : undefined;
  }, [userData]);

  const myRole: Role = useMemo(
    () => currentWorkspace?.members?.find(m => m.userId === me?.id)?.role,
    [currentWorkspace?.members, me?.id],
  );

  const showPublishAction = useMemo(
    () => !currentProject?.requestRoles?.includes(myRole),
    [currentProject?.requestRoles, myRole],
  );

  const currentItem: Item | undefined = useMemo(
    () => convertItem(data?.node as GQLItem),
    [data?.node],
  );

  const formReferenceItemsIds = useMemo(
    () =>
      (currentItem?.fields
        ?.filter(
          field => field.type === "Reference" && field.value && typeof field.value === "string",
        )
        .map(field => field.value) as string[]) ?? [],
    [currentItem?.fields],
  );

  const { data: gqlFormItemsData } = useGetItemsByIdsQuery({
    fetchPolicy: "no-cache",
    variables: {
      id: formReferenceItemsIds,
    },
    skip: formReferenceItemsIds.length === 0,
  });

  const formItemsData: FormItem[] | undefined = useMemo(
    () => gqlFormItemsData?.nodes as FormItem[],
    [gqlFormItemsData?.nodes],
  );

  const { data: groupData } = useGetGroupsQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const groups = useMemo(() => {
    return groupData?.groups
      ?.map<Group | undefined>(group => (group ? fromGraphQLGroup(group as GQLGroup) : undefined))
      .filter((group): group is Group => !!group);
  }, [groupData?.groups]);

  const handleNavigateToModel = useCallback(
    (modelId?: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${modelId}${
          location.state ?? ""
        }`,
      );
    },
    [navigate, currentWorkspace?.id, currentProject?.id, location.state],
  );
  const [createItem, { loading: itemCreationLoading }] = useCreateItemMutation({
    refetchQueries: ["SearchItem", "GetRequests"],
  });

  const handleItemCreate = useCallback(
    async ({
      schemaId,
      metaSchemaId,
      fields,
      metaFields,
    }: {
      schemaId: string;
      metaSchemaId: string;
      fields: ItemField[];
      metaFields: ItemField[];
    }) => {
      if (!currentModel?.id) return;
      let metadataId = null;
      if (metaSchemaId) {
        const metaItem = await createItem({
          variables: {
            modelId: currentModel.id,
            schemaId: metaSchemaId,
            fields: metaFields as ItemFieldInput[],
          },
        });
        if (metaItem.errors || !metaItem.data?.createItem) {
          Notification.error({ message: t("Failed to create item.") });
          return;
        }
        metadataId = metaItem.data.createItem.item.id;
      }
      const item = await createItem({
        variables: {
          modelId: currentModel.id,
          schemaId: schemaId,
          fields: fields as ItemFieldInput[],
          metadataId,
        },
      });
      if (item.errors || !item.data?.createItem) {
        Notification.error({ message: t("Failed to create item.") });
        return;
      }
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}/details/${item.data.createItem.item.id}`,
      );
      Notification.success({ message: t("Successfully created Item!") });
    },
    [currentModel?.id, createItem, navigate, currentWorkspace?.id, currentProject?.id, t],
  );

  const [updateItem, { loading: itemUpdatingLoading }] = useUpdateItemMutation({
    refetchQueries: ["SearchItem", "GetItem"],
  });

  const handleItemUpdate = useCallback(
    async ({ itemId, fields }: { itemId: string; fields: ItemField[] }) => {
      const item = await updateItem({
        variables: {
          itemId: itemId,
          fields: fields as ItemFieldInput[],
          version: currentItem?.version ?? "",
        },
      });
      if (item.errors || !item.data?.updateItem) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      }
      Notification.success({ message: t("Successfully updated Item!") });
    },
    [updateItem, currentItem?.version, t],
  );

  const handleMetaItemUpdate = useCallback(
    async ({ metaItemId, metaFields }: { metaItemId: string; metaFields: ItemField[] }) => {
      const item = await updateItem({
        variables: {
          itemId: metaItemId,
          fields: metaFields as ItemFieldInput[],
          version: currentItem?.metadata?.version ?? "",
        },
      });
      if (item.errors || !item.data?.updateItem) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      }
      Notification.success({ message: t("Successfully updated Item!") });
    },
    [updateItem, currentItem?.metadata?.version, t],
  );

  const dateConvert = useCallback((value?: ItemValue) => {
    if (Array.isArray(value)) {
      return (value as string[]).map(valueItem => (valueItem ? moment(valueItem) : ""));
    } else {
      return value ? moment(value as string) : "";
    }
  }, []);

  const valueGet = useCallback(
    (field: Field) => {
      switch (field.type) {
        case "Select":
          return field.typeProperty?.selectDefaultValue;
        case "Integer":
          return field.typeProperty?.integerDefaultValue;
        case "Asset":
          return field.typeProperty?.assetDefaultValue;
        case "Date":
          return dateConvert(field.typeProperty?.defaultValue);
        default:
          return field.typeProperty?.defaultValue;
      }
    },
    [dateConvert],
  );

  const initialFormValues: { [key: string]: any } = useMemo(() => {
    const initialValues: { [key: string]: any } = {};
    if (!currentItem) {
      const updateInitialValues = (value: any, id: string, itemGroupId: string) => {
        if (typeof initialValues[id] === "object" && !Array.isArray(initialValues[id])) {
          initialValues[id][itemGroupId] = value;
        } else {
          initialValues[id] = { [itemGroupId]: value };
        }
      };

      const groupInitialValuesUpdate = (group: Group, itemGroupId: string) => {
        group?.schema?.fields?.forEach(field => {
          updateInitialValues(valueGet(field), field.id, itemGroupId);
        });
      };

      currentModel?.schema.fields.forEach(field => {
        switch (field.type) {
          case "Select":
            initialValues[field.id] = field.typeProperty?.selectDefaultValue;
            break;
          case "Integer":
            initialValues[field.id] = field.typeProperty?.integerDefaultValue;
            break;
          case "Asset":
            initialValues[field.id] = field.typeProperty?.assetDefaultValue;
            break;
          case "Group":
            if (field.multiple) {
              initialValues[field.id] = [];
            } else {
              const id = newID();
              initialValues[field.id] = id;
              const group = groups?.find(group => group.id === field.typeProperty?.groupId);
              if (group) groupInitialValuesUpdate(group, id);
            }
            break;
          case "Date":
            initialValues[field.id] = dateConvert(field.typeProperty?.defaultValue);
            break;
          default:
            initialValues[field.id] = field.typeProperty?.defaultValue;
            break;
        }
      });
    } else {
      currentItem?.fields?.forEach(field => {
        if (field.itemGroupId) {
          if (
            typeof initialValues[field.schemaFieldId] === "object" &&
            !Array.isArray(initialValues[field.schemaFieldId]) &&
            !moment.isMoment(initialValues[field.schemaFieldId])
          ) {
            initialValues[field.schemaFieldId][field.itemGroupId] =
              field.type === "Date" ? dateConvert(field.value) : field.value;
          } else {
            initialValues[field.schemaFieldId] = {
              [field.itemGroupId]: field.type === "Date" ? dateConvert(field.value) : field.value,
            };
          }
        } else {
          initialValues[field.schemaFieldId] =
            field.type === "Date" ? dateConvert(field.value) : field.value;
        }
      });
    }
    return initialValues;
  }, [currentItem, currentModel?.schema.fields, dateConvert, groups, valueGet]);

  const initialMetaFormValues: { [key: string]: any } = useMemo(() => {
    const initialValues: { [key: string]: any } = {};
    if (!currentItem && !itemLoading) {
      currentModel?.metadataSchema?.fields?.forEach(field => {
        switch (field.type) {
          case "Tag": {
            const value = field.typeProperty?.selectDefaultValue;
            initialValues[field.id] = field.multiple ? (Array.isArray(value) ? value : []) : value;
            break;
          }
          case "Date":
            initialValues[field.id] = dateConvert(field.typeProperty?.defaultValue);
            break;
          default:
            initialValues[field.id] = field.typeProperty?.defaultValue;
            break;
        }
      });
    } else {
      currentItem?.metadata.fields?.forEach(field => {
        initialValues[field.schemaFieldId] =
          field.type === "Date" ? dateConvert(field.value) : field.value;
      });
    }
    return initialValues;
  }, [currentItem, currentModel, dateConvert, itemLoading]);

  const workspaceUserMembers = useMemo((): Member[] => {
    return (
      currentWorkspace?.members
        ?.map<Member | undefined>(member =>
          member.__typename === "WorkspaceUserMember" && member.user
            ? {
                userId: member.userId,
                user: member.user,
                role: member.role,
              }
            : undefined,
        )
        .filter(
          (user): user is Member => !!user && (user.role === "OWNER" || user.role === "MAINTAINER"),
        ) ?? []
    );
  }, [currentWorkspace]);

  const [createRequestMutation, { loading: requestCreationLoading }] = useCreateRequestMutation({
    refetchQueries: ["GetRequests"],
  });

  const handleRequestCreate = useCallback(
    async (data: {
      title: string;
      description: string;
      state: RequestState;
      reviewersId: string[];
      items: { itemId: string }[];
    }) => {
      if (!currentProject?.id) return;
      const request = await createRequestMutation({
        variables: {
          projectId: currentProject.id,
          title: data.title,
          description: data.description,
          state: data.state as GQLRequestState,
          reviewersId: data.reviewersId,
          items: data.items,
        },
      });
      if (request.errors || !request.data?.createRequest) {
        Notification.error({ message: t("Failed to create request.") });
        return;
      }
      Notification.success({ message: t("Successfully created request!") });
      setRequestModalShown(false);
    },
    [createRequestMutation, currentProject?.id, t],
  );

  const [updateRequestMutation] = useUpdateRequestMutation({
    refetchQueries: ["GetRequests"],
  });

  const handleRequestUpdate = useCallback(
    async (data: RequestUpdatePayload) => {
      if (!data.requestId) return;
      const request = await updateRequestMutation({
        variables: {
          requestId: data.requestId,
          title: data.title,
          description: data.description,
          state: data.state as GQLRequestState,
          reviewersId: data.reviewersId,
          items: data.items,
        },
      });
      if (request.errors || !request.data?.updateRequest) {
        Notification.error({ message: t("Failed to update request.") });
        return;
      }
      Notification.success({ message: t("Successfully updated request!") });
      setRequestModalShown(false);
    },
    [updateRequestMutation, t],
  );
  const handleModalClose = useCallback(() => setRequestModalShown(false), []);

  const handleModalOpen = useCallback(() => setRequestModalShown(true), []);

  const handleReferenceModelUpdate = useCallback((modelId?: string) => {
    setReferenceModelId(modelId);
  }, []);

  return {
    linkedItemsModalList,
    showPublishAction,
    requests,
    itemId,
    itemLoading,
    requestCreationLoading,
    currentModel,
    currentItem,
    formItemsData,
    initialFormValues,
    initialMetaFormValues,
    itemCreationLoading,
    itemUpdatingLoading,
    collapsedModelMenu,
    collapsedCommentsPanel,
    requestModalShown,
    groups,
    addItemToRequestModalShown,
    workspaceUserMembers,
    linkItemModalTitle: model.name,
    linkItemModalTotalCount: itemsData?.searchItem.totalCount || 0,
    linkItemModalPage,
    linkItemModalPageSize,
    handleReferenceModelUpdate,
    handleSearchTerm,
    handleLinkItemTableChange,
    handleRequestTableChange,
    handleRequestSearchTerm,
    requestModalLoading: loading,
    requestModalTotalCount: totalCount,
    requestModalPage: page,
    requestModalPageSize: pageSize,
    handlePublish,
    handleUnpublish,
    handleAddItemToRequest,
    collapseCommentsPanel,
    collapseModelMenu,
    handleItemCreate,
    handleItemUpdate,
    handleMetaItemUpdate,
    handleNavigateToModel,
    handleRequestCreate,
    handleRequestUpdate,
    handleModalClose,
    handleModalOpen,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
  };
};
