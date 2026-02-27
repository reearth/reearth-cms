import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Field, MetadataField } from "@reearth-cms/components/molecules/Schema/types";
import { Model as GQLModel, Maybe } from "@reearth-cms/gql/__generated__/graphql.generated";

export const fromGraphQLModel = (model: Maybe<GQLModel>): Model | undefined => {
  if (!model) return;

  return {
    description: model.description,
    id: model.id,
    key: model.key,
    metadataSchema: {
      fields: model.metadataSchema?.fields?.map(
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
          }) as MetadataField,
      ),
      id: model.metadataSchema?.id,
    },
    name: model.name,
    order: model.order ?? undefined,
    schema: {
      fields: model.schema?.fields?.map(
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
          }) as Field,
      ),
      id: model.schema?.id,
    },
    schemaId: model.schemaId,
  };
};
