import styled from "@emotion/styled";
import { Alert } from "antd";
import { useState } from "react";

import { Model } from "@reearth-cms/components/molecules/Model/types";
import { FormType } from "@reearth-cms/components/molecules/PublicAPI/types";
import { useT } from "@reearth-cms/i18n";
import { AntdToken } from "@reearth-cms/utils/style";

import AllowedOrigins from "./AllowedOrigins";
import PostingSettings from "./PostingSettings";

type Props = {
  apiUrl: string;
  isPublic?: boolean;
  initialValues: FormType;
  hasPublishRight: boolean;
  hasPostingRight: boolean;
  models: Pick<Model, "id" | "name" | "key">[];
  updateLoading: boolean;
};

const PostingTab: React.FC<Props> = ({
  apiUrl,
  isPublic,
  initialValues,
  hasPublishRight,
  hasPostingRight,
  models,
  updateLoading,
}) => {
  const t = useT();
  // Shared between the AllowedOrigins editor and the PostingSettings warning Alert.
  const [origins, setOrigins] = useState<string[]>([]);

  return (
    <Sections>
      {hasPostingRight ? (
        <>
          <AllowedOrigins origins={origins} onChange={setOrigins} />
          <PostingSettings
            apiUrl={apiUrl}
            initialValues={initialValues}
            isPublic={isPublic}
            hasPublishRight={hasPublishRight}
            models={models}
            updateLoading={updateLoading}
            origins={origins}
          />
        </>
      ) : (
        <Alert
          showIcon
          type="warning"
          message={t("Not enough permissions")}
          description={t("Only Maintainer role or above can change the settings of the Post API")}
        />
      )}
    </Sections>
  );
};

export default PostingTab;

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.BASE}px;
`;
