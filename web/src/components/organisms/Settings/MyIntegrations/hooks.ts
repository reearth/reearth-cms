import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";

import Notification from "@reearth-cms/components/atoms/Notification";
import type { FormValues } from "@reearth-cms/components/molecules/MyIntegrations/CreationModal";
import { fromGraphQLIntegration } from "@reearth-cms/components/organisms/DataConverters/setting";
import { IntegrationType } from "@reearth-cms/gql/__generated__/graphql.generated";
import { CreateIntegrationDocument } from "@reearth-cms/gql/__generated__/integration.generated";
import { GetMeDocument } from "@reearth-cms/gql/__generated__/user.generated";
import { useT } from "@reearth-cms/i18n";

export default () => {
  const t = useT();

  const { data, loading } = useQuery(GetMeDocument);

  const [createNewIntegration, { loading: createLoading }] = useMutation(
    CreateIntegrationDocument,
    {
      refetchQueries: ["GetMe"],
    },
  );

  const integrations = useMemo(
    () => data?.me?.integrations?.map(integration => fromGraphQLIntegration(integration)) ?? [],
    [data?.me?.integrations],
  );

  const handleIntegrationCreate = useCallback(
    async ({ name, description, logoUrl, type }: FormValues) => {
      const integration = await createNewIntegration({
        variables: {
          name,
          description,
          logoUrl,
          type: type === "Private" ? IntegrationType.Private : IntegrationType.Public,
        },
      });
      if (integration.error || !integration.data?.createIntegration) {
        Notification.error({ message: t("Failed to create integration.") });
        throw new Error();
      }
      Notification.success({ message: t("Successfully created integration!") });
    },
    [createNewIntegration, t],
  );

  const navigate = useNavigate();
  const location = useLocation();
  const handleIntegrationNavigate = useCallback(
    (integrationId: string) => {
      navigate(`${location.pathname}/${integrationId}`);
    },
    [location.pathname, navigate],
  );

  return {
    loading,
    integrations,
    createLoading,
    handleIntegrationCreate,
    handleIntegrationNavigate,
  };
};
