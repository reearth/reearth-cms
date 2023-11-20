import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Model as GQLModel } from "@reearth-cms/gql/graphql-client-api";

export const convertModel = (GQLModel: GQLModel): Model => {
  return {
    id: GQLModel?.id,
    schemaId: GQLModel?.schemaId,
    name: GQLModel?.name,
  };
};
