import { Alert } from "antd";

import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { Model } from "@reearth-cms/components/molecules/Model/types";

import PostingTable from "./PostingTable";

type Props = {
  apiUrl: string;
  hasPublishRight: boolean;
  models: Pick<Model, "id" | "name" | "key">[];
  origins?: string[];
};

const PostingSettings: React.FC<Props> = ({ apiUrl, hasPublishRight, models, origins }) => {
  return (
    <ContentSection hasPadding={false}>
      {!origins?.length && (
        <Alert
          showIcon
          description="Please add at least one origin to enable Post API"
          type="warning"
        />
      )}
      <PostingTable
        apiUrl={apiUrl}
        hasPublishRight={hasPublishRight}
        models={models}
        disabled={!origins?.length}
      />
    </ContentSection>
  );
};

export default PostingSettings;
