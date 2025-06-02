import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import { APIKey, FormType } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
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
  onAPIKeyEdit: (keyId: string) => void;
  onPublicUpdate: (
    settings: FormType,
    models: { modelId: string; status: boolean }[],
  ) => Promise<void>;
  onAPIKeyRegenerate: (id: string) => Promise<void>;
  onSettingsPageOpen: () => void;
};

const Accessibility: React.FC<Props> = ({
  initialValues,
  models,
  hasPublishRight,
  updateLoading,
  apiUrl,
  onAPIKeyEdit,
  onPublicUpdate,
  onSettingsPageOpen,
}) => {
  const t = useT();
  const isPublic = initialValues.scope === "PUBLIC";
  const keys: APIKey[] = [
    {
      id: "01g4eg4ay017hpw58fkh9nd89c",
      name: "Default API Key",
      description: "Default key for public access",
      key: "secret_SuV6vNbzH3WRh2CoOkaCZrGp5mUXCvLPKM36iYjNIoc",
      publication: { publicModels: ["01hth95j5caxs73physevzw15d"], publicAssets: true },
    },
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
      <APIKeyComponent
        keys={keys}
        isPublic={isPublic}
        onAPIKeyEdit={onAPIKeyEdit}
        onSettingsPageOpen={onSettingsPageOpen}
      />
    </InnerContent>
  );
};

export default Accessibility;
