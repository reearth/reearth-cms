import { ChangeEvent } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import { useT } from "@reearth-cms/i18n";

import ReadmeTab from "../ProjectOverview/ReadmeTab";
import { UpdateProjectInput } from "../Workspace/types";

type Props = {
  readmeValue: string;
  projectReadme?: string;
  readmeEditMode: boolean;
  hasUpdateRight: boolean;
  onProjectUpdate: (data: UpdateProjectInput) => Promise<void>;
  onReadmeSave: () => Promise<void>;
  onReadmeEdit: () => void;
  onReadmeMarkdownChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

const Readme: React.FC<Props> = ({
  readmeValue,
  projectReadme,
  readmeEditMode,
  hasUpdateRight,
  onReadmeSave,
  onReadmeEdit,
  onReadmeMarkdownChange,
}) => {
  const t = useT();

  return (
    <InnerContent
      title={t("Readme")}
      flexChildren
      subtitle={t("README is a crucial document helping people quickly understand your project")}
      extra={
        readmeEditMode ? (
          <Button
            type="primary"
            icon={<Icon icon="save" />}
            onClick={onReadmeSave}
            disabled={!hasUpdateRight}>
            {t("Save Changes")}
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<Icon icon="edit" />}
            onClick={onReadmeEdit}
            disabled={!hasUpdateRight}>
            {t("Edit")}
          </Button>
        )
      }>
      <ReadmeTab
        readmeValue={readmeValue}
        projectReadme={projectReadme}
        readmeEditMode={readmeEditMode}
        onReadmeMarkdownChange={onReadmeMarkdownChange}
      />
    </InnerContent>
  );
};

export default Readme;
