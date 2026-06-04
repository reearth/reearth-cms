import { useMemo } from "react";

import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { APIKey, FormType } from "@reearth-cms/components/molecules/PublicAPI/types";
import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";

import APIDocLinks from "../APIDocLinks";

import APIKeyComponent from "./APIKey";
import ReadingComponent from "./Reading";

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

const PublicAPI: React.FC<Props> = ({
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
  const documentUrl = useMemo<string>(
    () => (currentLang === "ja" ? Constant.PUBLIC_API_DOCS.ja : Constant.PUBLIC_API_DOCS.en),
    [currentLang],
  );

  return (
    <InnerContent
      title={t("Public API")}
      flexChildren
      subtitle={t("Control the visibility scope of the Content API")}
      extra={<APIDocLinks documentUrl={documentUrl} playgroundUrl="./publicApi/docs" />}>
      <ReadingComponent
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

export default PublicAPI;
