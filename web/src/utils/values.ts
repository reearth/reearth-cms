import { Model, Field, Group } from "@reearth-cms/components/molecules/Schema/types";
import {
  View,
  AndConditionInput,
  ItemSort,
  Condition,
  Column,
} from "@reearth-cms/components/molecules/View/types";
import {
  Maybe,
  Model as GQLModel,
  Group as GQLGroup,
  View as GQLView,
  FieldType as GQLFieldType,
  SortDirection as GQLSortDirection,
  AndConditionInput as GQLAndConditionInput,
  ItemSortInput as GQLItemSortInput,
  ColumnSelectionInput as GQLColumnSelectionInput,
} from "@reearth-cms/gql/graphql-client-api";

export const fromGraphQLModel = (model: Maybe<GQLModel>): Model | undefined => {
  if (!model) return;

  return {
    id: model.id,
    description: model.description,
    name: model.name,
    key: model.key,
    public: model.public,
    order: model.order ?? undefined,
    schema: {
      id: model.schema?.id,
      fields: model.schema?.fields.map(
        field =>
          ({
            id: field.id,
            description: field.description,
            title: field.title,
            type: field.type,
            key: field.key,
            unique: field.unique,
            isTitle: field.isTitle,
            multiple: field.multiple,
            required: field.required,
            typeProperty: field.typeProperty,
          }) as Field,
      ),
    },
    metadataSchema: {
      id: model.metadataSchema?.id,
      fields: model.metadataSchema?.fields.map(
        field =>
          ({
            id: field.id,
            description: field.description,
            title: field.title,
            type: field.type,
            key: field.key,
            unique: field.unique,
            isTitle: field.isTitle,
            multiple: field.multiple,
            required: field.required,
            typeProperty: field.typeProperty,
          }) as Field,
      ),
    },
  };
};

export const fromGraphQLGroup = (group: Maybe<GQLGroup>): Group | undefined => {
  if (!group) return;

  return {
    id: group.id,
    schemaId: group.schemaId,
    projectId: group.projectId,
    name: group.name,
    description: group.description,
    key: group.key,
    schema: {
      id: group.schema?.id,
      fields: group.schema?.fields.map(
        field =>
          ({
            id: field.id,
            description: field.description,
            title: field.title,
            type: field.type,
            key: field.key,
            unique: field.unique,
            isTitle: field.isTitle,
            multiple: field.multiple,
            required: field.required,
            typeProperty: field.typeProperty,
          }) as Field,
      ),
    },
  };
};

//view type conversions
export const fromGraphQLView = (view: GQLView): View | undefined => {
  if (!view) return;

  return {
    id: view.id,
    name: view.name,
    modelId: view.modelId,
    projectId: view.projectId,
    sort: view.sort
      ? {
          field: {
            id: view.sort.field.id ?? undefined,
            type: view.sort.field.type,
          },
          direction: view.sort.direction ? view.sort.direction : "ASC",
        }
      : undefined,
    columns: view.columns
      ? view.columns?.map(column => ({
          field: {
            type: column.field.type,
            id: column.field.id ?? undefined,
          },
          visible: column.visible,
        }))
      : undefined,
    filter: view.filter ? (view.filter as Condition) : undefined,
  };
};

export const toGraphItemSort = (sort: ItemSort): GQLItemSortInput | undefined => {
  return {
    field: {
      id: sort.field.id ?? undefined,
      type: sort.field.type as GQLFieldType,
    },
    direction: sort.direction ? (sort.direction as GQLSortDirection) : GQLSortDirection["Asc"],
  };
};

export const toGraphColumnSelectionInput = (column: Column): GQLColumnSelectionInput => {
  return {
    field: {
      id: column.field.id,
      type: column.field.type as GQLFieldType,
    },
    visible: column.visible,
  };
};

export const toGraphAndConditionInput = (condition: AndConditionInput): GQLAndConditionInput => {
  return condition as GQLAndConditionInput;
};
