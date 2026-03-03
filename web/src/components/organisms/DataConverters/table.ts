import {
  Column,
  ConditionInput,
  ItemSort,
  View,
} from "@reearth-cms/components/molecules/View/types";
import { filterConvert } from "@reearth-cms/components/organisms/Project/Content/ContentList/utils";
import {
  AndCondition as GQLAndCondition,
  ColumnSelectionInput as GQLColumnSelectionInput,
  ConditionInput as GQLConditionInput,
  FieldType as GQLFieldType,
  ItemSortInput as GQLItemSortInput,
  SortDirection as GQLSortDirection,
  View as GQLView,
} from "@reearth-cms/gql/__generated__/graphql.generated";

export const fromGraphQLView = (view: GQLView): View => ({
  columns: view.columns
    ? view.columns?.map(column => ({
        field: {
          id: column.field.id ?? undefined,
          type: column.field.type,
        },
        visible: column.visible,
      }))
    : undefined,
  filter: view.filter ? { and: filterConvert(view.filter as GQLAndCondition) } : undefined,
  id: view.id,
  modelId: view.modelId,
  name: view.name,
  order: view.order,
  projectId: view.projectId,
  sort: view.sort
    ? {
        direction: view.sort.direction ? view.sort.direction : "ASC",
        field: {
          id: view.sort.field.id ?? undefined,
          type: view.sort.field.type,
        },
      }
    : undefined,
});

export const toGraphItemSort = (sort?: ItemSort): GQLItemSortInput | undefined =>
  sort
    ? {
        direction: sort.direction as GQLSortDirection,
        field: {
          id: sort.field.id,
          type: sort.field.type as GQLFieldType,
        },
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
