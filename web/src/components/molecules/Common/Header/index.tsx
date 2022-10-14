import styled from "@emotion/styled";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth-cms/auth";
import Avatar from "@reearth-cms/components/atoms/Avatar";
import Header from "@reearth-cms/components/atoms/Header";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";
import { Project, Workspace } from "@reearth-cms/state";

import HeaderDropdown from "./Dropdown";
import type { User } from "./types";

export type { User } from "./types";

export interface Props {
  user: User;
  personalWorkspace?: Workspace;
  currentWorkspace?: Workspace;
  workspaces?: any[];
  currentProject?: Project;
  onWorkspaceModalOpen: () => void;
  onNavigateToSettings: () => void;
}

const HeaderMolecule: React.FC<Props> = ({
  user,
  personalWorkspace,
  currentWorkspace,
  workspaces,
  currentProject,
  onWorkspaceModalOpen,
  onNavigateToSettings,
}) => {
  const t = useT();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleWorkspaceChange = useCallback(
    (id: number) => {
      navigate(`/dashboard/${id}`);
    },
    [navigate],
  );

  const WorkspacesMenu = (
    <HeaderMenu
      items={[
        {
          label: t("Personal Account"),
          key: "personal-account",
          type: "group",
          children: workspaces
            ?.filter(workspace => workspace.id === personalWorkspace?.id)
            ?.map(workspace => ({
              label: workspace.name,
              key: workspace.id,
              icon: (
                <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }} size={"small"}>
                  {workspace.name.charAt(0)}
                </Avatar>
              ),
              onClick: () => handleWorkspaceChange(workspace.id),
            })),
        },
        {
          type: "divider",
        },
        {
          label: t("Workspaces"),
          key: "teams",
          type: "group",
          children: workspaces
            ?.filter(workspace => workspace.id !== personalWorkspace?.id)
            ?.map(workspace => ({
              label: workspace.name,
              key: workspace.id,
              icon: (
                <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }}>
                  {workspace.name.charAt(0)}
                </Avatar>
              ),
              onClick: () => handleWorkspaceChange(workspace.id),
            })),
        },
        {
          label: t("new workspace"),
          key: "new-workspace",
          icon: <Icon icon="userGroupAdd" />,
          onClick: onWorkspaceModalOpen,
        },
      ]}
    />
  );

  const AccountMenu = (
    <HeaderMenu
      items={[
        {
          label: t("Account Settings"),
          key: "account-settings",
          icon: <Icon icon="user" />,
          onClick: onNavigateToSettings,
        },
        {
          label: t("Logout"),
          key: "logout",
          icon: <Icon icon="logout" />,
          onClick: logout,
        },
      ]}
    />
  );

  return (
    <MainHeader>
      <Logo onClick={() => navigate("/")}>{t("Re:Earth CMS")}</Logo>
      <VerticalDivider />
      <WorkspaceDropdown name={currentWorkspace?.name} menu={WorkspacesMenu} />
      {currentProject?.name && <ProjectText>/ {currentProject.name}</ProjectText>}
      <Spacer />
      <AccountDropdown name={user.name} menu={AccountMenu} />
    </MainHeader>
  );
};

const MainHeader = styled(Header)`
  display: flex;
  align-items: center;
  height: 48px;
  line-height: 41px;
  padding: 0;
  background-color: #1d1d1d;
`;

const Logo = styled.div`
  display: inline-block;
  color: #df3013;
  font-weight: 500;
  font-size: 14px;
  line-height: 48px;
  cursor: pointer;
  padding: 0 40px 0 20px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const HeaderMenu = styled(Menu)`
  background-color: #1d1d1d;
  color: white;
  width: 190px;

  .ant-dropdown-menu-item-divider {
    background-color: #303030;
  }
  .ant-dropdown-menu-item-group-title,
  .ant-dropdown-menu-item,
  .ant-dropdown-menu-submenu-title {
    color: #dbdbdb;
  }
  .ant-dropdown-menu-item-group-title {
    font-weight: 400;
    font-size: 12px;
    line-height: 22px;
    user-select: none;
  }
  .ant-dropdown-menu-item,
  .ant-dropdown-menu-submenu-title {
    &:hover {
      background-color: #1d1d1d;
      color: #fff;
    }
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const VerticalDivider = styled.div`
  display: inline-block;
  height: 32px;
  color: #fff;
  margin: 0;
  vertical-align: middle;
  border-top: 0;
  border-left: 1px solid #303030;
`;

const WorkspaceDropdown = styled(HeaderDropdown)`
  margin-left: 20px;
  padding-left: 20px;
`;

const AccountDropdown = styled(HeaderDropdown)`
  padding-right: 20px;
`;

const ProjectText = styled.p`
  color: #fff;
  margin: 0 0 0 10px;
`;

export default HeaderMolecule;
