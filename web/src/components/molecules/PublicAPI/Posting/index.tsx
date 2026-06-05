import styled from "@emotion/styled";
import { useState } from "react";

import { Model } from "@reearth-cms/components/molecules/Model/types";
import { FormType } from "@reearth-cms/components/molecules/PublicAPI/types";
import { AntdToken } from "@reearth-cms/utils/style";

import AllowedOrigins from "./AllowedOrigins";
import PostingSettings from "./PostingSettings";

type Props = {
  apiUrl: string;
  isPublic?: boolean;
  initialValues: FormType;
  hasPublishRight: boolean;
  models: Pick<Model, "id" | "name" | "key">[];
  updateLoading: boolean;
};

const PostingTab: React.FC<Props> = ({
  apiUrl,
  isPublic,
  initialValues,
  hasPublishRight,
  models,
  updateLoading,
}) => {
  // Shared between the AllowedOrigins editor and the PostingSettings warning Alert.
  const [origins, setOrigins] = useState<string[]>([]);

  return (
    <Sections>
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
    </Sections>
  );
};

export default PostingTab;

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.BASE}px;
`;
