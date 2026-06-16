import { Alert } from "antd";

import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";

import PostingTable from "./PostingTable";

type Props = {
  apiUrl: string;
  hasPublishRight: boolean;
  models: Pick<Model, "id" | "name" | "key">[];
  origins?: string[];
};

const PostingSettings: React.FC<Props> = ({ apiUrl, hasPublishRight, models, origins }) => {
  const t = useT();

  return (
    <ContentSection hasPadding={false}>
      {!origins?.length && (
        <Alert
          showIcon
          description={t("Please add at least one origin to enable Post API")}
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
