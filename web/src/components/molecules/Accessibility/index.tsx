import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import { APIKey, FormType } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";

import AccessAPIComponent from "./AccessAPI";
import APIKeyComponent from "./APIKey";
import APIDocLink from "./APIDocLink";

type Props = {
  apiKeys?: APIKey[];
  isProjectPublic?: boolean;
  initialValues: FormType;
  models: Pick<Model, "id" | "name" | "key">[];
  hasPublishRight: boolean;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  updateLoading: boolean;
  apiUrl: string;
  alias: string;
  onAPIKeyNew: () => void;
  onAPIKeyEdit: (keyId?: string) => void;
  onAPIKeyDelete: (id: string) => Promise<void>;
  onPublicUpdate: (
    settings: FormType,
    models: { modelId: string; status: boolean }[],
  ) => Promise<void>;
  onSettingsPageOpen: () => void;
  currentLang: string;
};

const Accessibility: React.FC<Props> = ({
  apiKeys,
  isProjectPublic,
  initialValues,
  models,
  hasPublishRight,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
  updateLoading,
  apiUrl,
  onAPIKeyNew,
  onAPIKeyEdit,
  onAPIKeyDelete,
  onPublicUpdate,
  onSettingsPageOpen,
  currentLang,
}) => {
  const t = useT();

  return (
    <InnerContent
      title={t("Accessibility")}
      flexChildren
      subtitle={t("Control the visibility scope of the Content API")}
      extra={<APIDocLink currentLang={currentLang} />}>
      <AccessAPIComponent
        apiUrl={apiUrl}
        initialValues={initialValues}
        isPublic={isProjectPublic}
        hasPublishRight={hasPublishRight}
        models={models}
        updateLoading={updateLoading}
        onAPIKeyEdit={onAPIKeyEdit}
        onPublicUpdate={onPublicUpdate}
      />
      <APIKeyComponent
        keys={apiKeys}
        isPublic={isProjectPublic}
        hasCreateRight={hasCreateRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
        onAPIKeyNew={onAPIKeyNew}
        onAPIKeyEdit={onAPIKeyEdit}
        onAPIKeyDelete={onAPIKeyDelete}
        onSettingsPageOpen={onSettingsPageOpen}
      />
    </InnerContent>
  );
};

export default Accessibility;
