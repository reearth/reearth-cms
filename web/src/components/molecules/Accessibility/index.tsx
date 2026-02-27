import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import { APIKey, FormType } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";

import AccessAPIComponent from "./AccessAPI";
import APIKeyComponent from "./APIKey";

type Props = {
  alias: string;
  apiKeys?: APIKey[];
  apiUrl: string;
  hasCreateRight: boolean;
  hasDeleteRight: boolean;
  hasPublishRight: boolean;
  hasUpdateRight: boolean;
  initialValues: FormType;
  isProjectPublic?: boolean;
  models: Pick<Model, "id" | "key" | "name">[];
  onAPIKeyDelete: (id: string) => Promise<void>;
  onAPIKeyEdit: (keyId?: string) => void;
  onAPIKeyNew: () => void;
  onPublicUpdate: (
    settings: FormType,
    models: { modelId: string; status: boolean }[],
  ) => Promise<void>;
  onSettingsPageOpen: () => void;
  updateLoading: boolean;
};

const Accessibility: React.FC<Props> = ({
  apiKeys,
  apiUrl,
  hasCreateRight,
  hasDeleteRight,
  hasPublishRight,
  hasUpdateRight,
  initialValues,
  isProjectPublic,
  models,
  onAPIKeyDelete,
  onAPIKeyEdit,
  onAPIKeyNew,
  onPublicUpdate,
  onSettingsPageOpen,
  updateLoading,
}) => {
  const t = useT();

  return (
    <InnerContent
      flexChildren
      subtitle={t("Control the visibility scope of the Content API")}
      title={t("Accessibility")}>
      <AccessAPIComponent
        apiUrl={apiUrl}
        hasPublishRight={hasPublishRight}
        initialValues={initialValues}
        isPublic={isProjectPublic}
        models={models}
        onAPIKeyEdit={onAPIKeyEdit}
        onPublicUpdate={onPublicUpdate}
        updateLoading={updateLoading}
      />
      <APIKeyComponent
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        isPublic={isProjectPublic}
        keys={apiKeys}
        onAPIKeyDelete={onAPIKeyDelete}
        onAPIKeyEdit={onAPIKeyEdit}
        onAPIKeyNew={onAPIKeyNew}
        onSettingsPageOpen={onSettingsPageOpen}
      />
    </InnerContent>
  );
};

export default Accessibility;
