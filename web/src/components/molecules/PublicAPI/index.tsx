import { useMemo } from "react";

import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { APIKey, FormType } from "@reearth-cms/components/molecules/PublicAPI/types";
import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";

import APIDocLinks from "../APIDocLinks";

import PostingTab from "./Posting";
import ReadingTab from "./Reading";

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
      extra={<APIDocLinks documentUrl={documentUrl} playgroundUrl="./publicApi/docs" />}
      tabs={[
        {
          key: "reading",
          label: t("Reading"),
          children: (
            <ReadingTab
              apiUrl={apiUrl}
              initialValues={initialValues}
              isPublic={isProjectPublic}
              hasPublishRight={hasPublishRight}
              hasCreateRight={hasCreateRight}
              hasUpdateRight={hasUpdateRight}
              hasDeleteRight={hasDeleteRight}
              models={models}
              updateLoading={updateLoading}
              apiKeys={apiKeys}
              onAPIKeyNew={onAPIKeyNew}
              onAPIKeyEdit={onAPIKeyEdit}
              onAPIKeyDelete={onAPIKeyDelete}
              onPublicUpdate={onPublicUpdate}
              onSettingsPageOpen={onSettingsPageOpen}
            />
          ),
        },
        {
          key: "posting",
          label: t("Posting"),
          children: (
            <PostingTab
              apiUrl={apiUrl}
              initialValues={initialValues}
              isPublic={isProjectPublic}
              hasPublishRight={hasPublishRight}
              models={models}
              updateLoading={updateLoading}
            />
          ),
        },
      ]}
    />
  );
};

export default PublicAPI;
