import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Content from "@reearth-cms/components/atoms/Content";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  handleProjectSearch: (value: string) => void;
  handleProjectModalOpen: () => void;
  handleWorkspaceModalOpen?: () => void;
};

const WorkspaceHeader: React.FC<Props> = ({
  handleProjectSearch,
  handleProjectModalOpen,
  handleWorkspaceModalOpen,
}) => {
  const t = useT();
  const { Search } = Input;

  return (
    <ActionHeader>
      <Search
        onSearch={handleProjectSearch}
        placeholder={t("input search text")}
        allowClear
        type="text"
        style={{ width: 264 }}
      />
      <ButtonWrapper>
        <Button onClick={handleWorkspaceModalOpen}>{t("Create a Workspace")}</Button>
        <Button onClick={handleProjectModalOpen} type="primary" icon={<Icon icon="plus" />}>
          {t("New Project")}
        </Button>
      </ButtonWrapper>
    </ActionHeader>
  );
};

const ActionHeader = styled(Content)`
  max-width: 1200px;
  margin: auto;
  padding: 16px;
  display: flex;
  justify-content: space-between;
`;

const ButtonWrapper = styled.div`
  Button + Button {
    margin-left: 8px;
  }
`;

export default WorkspaceHeader;
