import styled from "@emotion/styled";

import Content from "@reearth-cms/components/atoms/Content";
import Search from "@reearth-cms/components/atoms/Search";
import { FormValues as ProjectFormValues } from "@reearth-cms/components/molecules/Common/ProjectCreationModal";
import { FormValues as WorkspaceFormValues } from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import CreateProjectButton from "@reearth-cms/components/molecules/Workspace/CreateProjectButton";
import CreateWorkspaceButton from "@reearth-cms/components/molecules/Workspace/CreateWorkspaceButton";
import { useT } from "@reearth-cms/i18n";

type Props = {
  hasCreateRight: boolean;
  onWorkspaceCreate: (values: WorkspaceFormValues) => Promise<void>;
  onProjectSearch: (value: string) => void;
  onProjectCreate: (values: ProjectFormValues) => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
};

const WorkspaceHeader: React.FC<Props> = ({
  hasCreateRight,
  onWorkspaceCreate,
  onProjectSearch,
  onProjectCreate,
  onProjectAliasCheck,
}) => {
  const t = useT();

  return (
    <ActionHeader>
      <StyledSearch
        onSearch={onProjectSearch}
        placeholder={t("search projects")}
        allowClear
        type="text"
      />
      <ButtonWrapper>
        <CreateWorkspaceButton onWorkspaceCreate={onWorkspaceCreate} />
        <CreateProjectButton
          hasCreateRight={hasCreateRight}
          onProjectCreate={onProjectCreate}
          onProjectAliasCheck={onProjectAliasCheck}
        />
      </ButtonWrapper>
    </ActionHeader>
  );
};

const ActionHeader = styled(Content)`
  display: flex;
  justify-content: space-between;
  margin: auto;
  padding-bottom: 16px;
`;

const ButtonWrapper = styled.div`
  Button + Button {
    margin-left: 8px;
  }
`;

const StyledSearch = styled(Search)`
  width: 264px;
`;

export default WorkspaceHeader;
