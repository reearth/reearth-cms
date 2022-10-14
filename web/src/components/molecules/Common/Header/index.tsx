import styled from "@emotion/styled";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@reearth-cms/auth";
import Avatar from "@reearth-cms/components/atoms/Avatar";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";
import Space from "@reearth-cms/components/atoms/Space";
import { useT } from "@reearth-cms/i18n";
import { Workspace } from "@reearth-cms/state";

import type { User } from "./types";

export type { User } from "./types";

export interface Props {
  user: User;
  currentWorkspace?: Workspace;
  personalWorkspace?: Workspace;
  workspaces?: any[];
  onModalOpen: () => void;
}

const Header: React.FC<Props> = ({
  user,
  currentWorkspace,
  workspaces,
  personalWorkspace,
  onModalOpen,
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
                <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }}>
                  {workspace.name.charAt(0)}
                </Avatar>
              ),
              onClick: () => handleWorkspaceChange(workspace.id),
            })),
        },
        {
          label: t("Teams"),
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
          onClick: onModalOpen,
        },
      ]}
    />
  );

  const menu = (
    <HeaderMenu
      items={[
        {
          label: t("Account Settings"),
          key: "account-settings",
          icon: <Icon icon="user" />,
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
    <>
      <Logo onClick={() => navigate("/")}>{t("Re:Earth CMS")}</Logo>
      <VerticalDivider />
      <WorkspaceDropdown overlay={WorkspacesMenu}>
        <a onClick={e => e.preventDefault()}>
          <Space>
            {currentWorkspace?.name}
            <Icon icon="caretDown" />
          </Space>
        </a>
      </WorkspaceDropdown>
      <Spacer />
      <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }}>{user.name.charAt(0)}</Avatar>
      <AccountDropdown overlay={menu}>
        <a onClick={e => e.preventDefault()}>
          <Space>
            {user.name}
            <Icon icon="caretDown" />
          </Space>
        </a>
      </AccountDropdown>
    </>
  );
};

const Logo = styled.div`
  display: inline-block;
  color: #df3013;
  font-weight: 500;
  font-size: 14px;
  line-height: 48px;
  cursor: pointer;
`;

const Spacer = styled.div`
  flex: 1;
`;

const HeaderMenu = styled(Menu)`
  background-color: #1d1d1d;
  .ant-dropdown-menu-item,
  .ant-dropdown-menu-submenu-title {
    color: #dbdbdb;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
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

const AccountDropdown = styled(Dropdown)`
  padding-left: 10px;
  color: #fff;
  background-color: #141414;
`;

const WorkspaceDropdown = styled(Dropdown)`
  padding-left: 10px;
  color: #fff;
  background-color: #141414;
`;

const VerticalDivider = styled.div`
  position: relative;
  top: -0.06em;
  display: inline-block;
  height: 32px;
  color: #fff;
  margin: 0 8px;
  vertical-align: middle;
  border-top: 0;
  border-left: 1px solid #303030;
`;

export default Header;
