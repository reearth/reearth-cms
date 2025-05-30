import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import { FormType } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { ProjectPublicationScope } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

import AccessAPIComponent from "./AccessAPI";
import APIKeyComponent from "./APIKey";

type Props = {
  initialValues: FormType;
  models: Pick<Model, "id" | "name" | "key">[];
  hasPublishRight: boolean;
  updateLoading: boolean;
  regenerateLoading: boolean;
  apiUrl: string;
  alias: string;
  token: string;
  onPublicUpdate: (
    settings: FormType,
    models: { modelId: string; status: boolean }[],
  ) => Promise<void>;
  onRegenerateToken: () => Promise<void>;
};

const Accessibility: React.FC<Props> = ({
  initialValues,
  models,
  hasPublishRight,
  updateLoading,
  apiUrl,
  onPublicUpdate,
}) => {
  const t = useT();
  const isPublic = initialValues.scope === ProjectPublicationScope.Public;
  const keys = [
    { name: "Default API Key", key: "secret_SuV6vNbzH3WRh2CoOkaCZrGp5mUXCvLPKM36iYjNIoc" },
  ];

  return (
    <InnerContent
      title={t("Accessibility")}
      flexChildren
      subtitle={t("Control the visibility scope of the Content API")}>
      <AccessAPIComponent
        initialValues={initialValues}
        isPublic={isPublic}
        models={models}
        hasPublishRight={hasPublishRight}
        updateLoading={updateLoading}
        apiUrl={apiUrl}
        onPublicUpdate={onPublicUpdate}
      />
      <APIKeyComponent keys={keys} isPublic={isPublic} />
    </InnerContent>
  );
};

export default Accessibility;
