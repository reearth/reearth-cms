import { useMemo } from "react";

import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import {
  APIKey,
  FormType,
  PostingFormType,
} from "@reearth-cms/components/molecules/PublicAPI/types";
import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";

import APIDocLinks from "../APIDocLinks";

import PostingTab from "./Posting";
import APIKeyComponent from "./Reading/APIKey";
import ReadingSettings from "./Reading/ReadingSettings";

type Props = {
  apiKeys?: APIKey[];
  isProjectPublic?: boolean;
  initialValues: FormType;
  postingInitialValues: PostingFormType;
  savedOrigins: string[];
  models: Pick<Model, "id" | "name" | "key">[];
  hasPublishRight: boolean;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  hasPostingRight: boolean;
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
  onPostingUpdate: (
    origins: string[],
    models: { modelId: string; status: boolean }[],
  ) => Promise<void>;
  onSettingsPageOpen: () => void;
  currentLang: string;
};

const PublicAPI: React.FC<Props> = ({
  apiKeys,
  isProjectPublic,
  initialValues,
  postingInitialValues,
  savedOrigins,
  models,
  hasPublishRight,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
  hasPostingRight,
  updateLoading,
  apiUrl,
  onAPIKeyNew,
  onAPIKeyEdit,
  onAPIKeyDelete,
  onPublicUpdate,
  onPostingUpdate,
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
      extra={<APIDocLinks documentUrl={documentUrl} playgroundUrl="./publicApi/docs" />}
      tabs={[
        {
          key: "reading",
          label: t("Reading"),
          children: [
            <ReadingSettings
              key="settings"
              apiUrl={apiUrl}
              initialValues={initialValues}
              isPublic={isProjectPublic}
              hasPublishRight={hasPublishRight}
              models={models}
              updateLoading={updateLoading}
              onPublicUpdate={onPublicUpdate}
            />,
            <APIKeyComponent
              key="apikey"
              keys={apiKeys}
              isPublic={isProjectPublic}
              hasCreateRight={hasCreateRight}
              hasUpdateRight={hasUpdateRight}
              hasDeleteRight={hasDeleteRight}
              onAPIKeyNew={onAPIKeyNew}
              onAPIKeyEdit={onAPIKeyEdit}
              onAPIKeyDelete={onAPIKeyDelete}
              onSettingsPageOpen={onSettingsPageOpen}
            />,
          ],
        },
        {
          key: "posting",
          label: t("Posting"),
          children: (
            <PostingTab
              apiUrl={apiUrl}
              initialValues={postingInitialValues}
              savedOrigins={savedOrigins}
              hasPublishRight={hasPublishRight}
              hasPostingRight={hasPostingRight}
              models={models}
              updateLoading={updateLoading}
              onPostingUpdate={onPostingUpdate}
            />
          ),
        },
      ]}
    />
  );
};

export default PublicAPI;
