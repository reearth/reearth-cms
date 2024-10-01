import {
  View,
  ItemSort,
  Column,
  ConditionInput,
} from "@reearth-cms/components/molecules/View/types";
import { filterConvert } from "@reearth-cms/components/organisms/Project/Content/ContentList/utils";
import {
  View as GQLView,
  FieldType as GQLFieldType,
  SortDirection as GQLSortDirection,
  ItemSortInput as GQLItemSortInput,
  ColumnSelectionInput as GQLColumnSelectionInput,
  AndCondition as GQLAndCondition,
  ConditionInput as GQLConditionInput,
} from "@reearth-cms/gql/graphql-client-api";

export const fromGraphQLView = (view: GQLView): View => ({
  id: view.id,
  name: view.name,
  modelId: view.modelId,
  projectId: view.projectId,
  order: view.order,
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
  filter: view.filter ? { and: filterConvert(view.filter as GQLAndCondition) } : undefined,
});

export const toGraphItemSort = (sort?: ItemSort): GQLItemSortInput | undefined =>
  sort
    ? {
        field: {
          id: sort.field.id,
          type: sort.field.type as GQLFieldType,
        },
        direction: sort.direction as GQLSortDirection,
      }
    : undefined;

export const toGraphColumnSelectionInput = (
  columns?: Column[],
): GQLColumnSelectionInput[] | undefined =>
  columns
    ? columns.map(
        column =>
          ({
            field: {
              id: column.field.id,
              type: column.field.type as GQLFieldType,
            },
            visible: column.visible,
          }) as GQLColumnSelectionInput,
      )
    : undefined;

export const toGraphConditionInput = (conditionInput?: ConditionInput) =>
  conditionInput ? (conditionInput as GQLConditionInput) : undefined;
