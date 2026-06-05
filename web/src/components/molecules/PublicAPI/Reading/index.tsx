import styled from "@emotion/styled";

import { Model } from "@reearth-cms/components/molecules/Model/types";
import { APIKey, FormType } from "@reearth-cms/components/molecules/PublicAPI/types";
import { AntdToken } from "@reearth-cms/utils/style";

import APIKeyComponent from "./APIKey";
import ReadingSettings from "./ReadingSettings";

type Props = {
  apiUrl: string;
  isPublic?: boolean;
  initialValues: FormType;
  hasPublishRight: boolean;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  models: Pick<Model, "id" | "name" | "key">[];
  updateLoading: boolean;
  apiKeys?: APIKey[];
  onAPIKeyNew: () => void;
  onAPIKeyEdit: (keyId?: string) => void;
  onAPIKeyDelete: (id: string) => Promise<void>;
  onPublicUpdate: (
    settings: FormType,
    models: { modelId: string; status: boolean }[],
  ) => Promise<void>;
  onSettingsPageOpen: () => void;
};

const ReadingTab: React.FC<Props> = ({
  apiUrl,
  isPublic,
  initialValues,
  hasPublishRight,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
  models,
  updateLoading,
  apiKeys,
  onAPIKeyNew,
  onAPIKeyEdit,
  onAPIKeyDelete,
  onPublicUpdate,
  onSettingsPageOpen,
}) => {
  return (
    <Sections>
      <ReadingSettings
        apiUrl={apiUrl}
        initialValues={initialValues}
        isPublic={isPublic}
        hasPublishRight={hasPublishRight}
        models={models}
        updateLoading={updateLoading}
        onAPIKeyEdit={onAPIKeyEdit}
        onPublicUpdate={onPublicUpdate}
      />
      <APIKeyComponent
        keys={apiKeys}
        isPublic={isPublic}
        hasCreateRight={hasCreateRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
        onAPIKeyNew={onAPIKeyNew}
        onAPIKeyEdit={onAPIKeyEdit}
        onAPIKeyDelete={onAPIKeyDelete}
        onSettingsPageOpen={onSettingsPageOpen}
      />
    </Sections>
  );
};

export default ReadingTab;

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.BASE}px;
`;
