import { Group, GroupField } from "@reearth-cms/components/molecules/Schema/types";
import { Group as GQLGroup, Maybe } from "@reearth-cms/gql/__generated__/graphql.generated";

export const fromGraphQLGroup = (group: Maybe<GQLGroup>): Group | undefined => {
  if (!group) return;

  return {
    description: group.description,
    id: group.id,
    key: group.key,
    name: group.name,
    order: group.order,
    projectId: group.projectId,
    schema: {
      fields: group.schema?.fields.map(
        field =>
          ({
            description: field.description,
            id: field.id,
            isTitle: field.isTitle,
            key: field.key,
            multiple: field.multiple,
            required: field.required,
            title: field.title,
            type: field.type,
            typeProperty: field.typeProperty,
            unique: field.unique,
          }) as GroupField,
      ),
      id: group.schema?.id,
    },
    schemaId: group.schemaId,
  };
};
