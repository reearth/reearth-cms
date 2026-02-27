import styled from "@emotion/styled";
import { MenuProps } from "antd";
import { useMemo } from "react";

import { useAuth } from "@reearth-cms/auth";
import Header from "@reearth-cms/components/atoms/Header";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { Project, Workspace } from "@reearth-cms/components/molecules/Workspace/types";
import { ProjectVisibility } from "@reearth-cms/gql/__generated__/graphql.generated";
import { useT } from "@reearth-cms/i18n";
import { parseConfigBoolean } from "@reearth-cms/utils/format";

import HeaderDropdown from "./Dropdown";

type Props = {
  currentProject?: Project;
  currentWorkspace?: Workspace;
  logoUrl?: string;
  onHomeNavigation: () => void;
  onNavigateToSettings: () => void;
  onWorkspaceModalOpen: () => void;
  onWorkspaceNavigation: (id: string) => void;
  personalWorkspace?: Workspace;
  profilePictureUrl?: string;
  username: string;
  workspaces?: Workspace[];
};

const HeaderMolecule: React.FC<Props> = ({
  currentProject,
  currentWorkspace,
  logoUrl,
  onHomeNavigation,
  onNavigateToSettings,
  onWorkspaceModalOpen,
  onWorkspaceNavigation,
  personalWorkspace,
  profilePictureUrl,
  username,
  workspaces,
}) => {
  const t = useT();
  const { logout } = useAuth();
  const url = useMemo(() => {
    if (window.REEARTH_CONFIG?.editorUrl && currentWorkspace?.id) {
      return new URL(`dashboard/${currentWorkspace.id}`, window.REEARTH_CONFIG?.editorUrl);
    }
    return undefined;
  }, [currentWorkspace?.id]);

  const currentIsPersonal = useMemo(
    () => currentWorkspace?.id === personalWorkspace?.id,
    [currentWorkspace?.id, personalWorkspace?.id],
  );

  const disableWorkspaceUi = parseConfigBoolean(window.REEARTH_CONFIG?.disableWorkspaceUi);
  const WorkspacesItems: MenuProps["items"] = useMemo(() => {
    const res: MenuProps["items"] = [
      {
        children: workspaces
          ?.filter(workspace => workspace.id === personalWorkspace?.id)
          ?.map(workspace => ({
            icon: (
              <UserAvatar
                profilePictureUrl={profilePictureUrl}
                size="small"
                username={workspace.name}
              />
            ),
            key: workspace.id,
            label: (
              <Tooltip placement="right" title={workspace.name}>
                <MenuText>{workspace.name}</MenuText>
              </Tooltip>
            ),
            onClick: () => onWorkspaceNavigation(workspace.id),
            style: { paddingLeft: 0, paddingRight: 0 },
          })),
        key: "personal-account",
        label: t("Personal Account"),
        type: "group",
      },
      {
        type: "divider",
      },
      {
        children: workspaces
          ?.filter(workspace => workspace.id !== personalWorkspace?.id)
          ?.map(workspace => ({
            icon: <UserAvatar shape="square" size="small" username={workspace.name} />,
            key: workspace.id,
            label: (
              <Tooltip placement="right" title={workspace.name}>
                <MenuText>{workspace.name}</MenuText>
              </Tooltip>
            ),
            onClick: () => onWorkspaceNavigation(workspace.id),
            style: { paddingLeft: 0, paddingRight: 0 },
          })),
        key: "workspaces",
        label: t("Workspaces"),
        type: "group",
      },
    ];
    if (!disableWorkspaceUi) {
      res.push({
        icon: <Icon icon="userGroupAdd" />,
        key: "new-workspace",
        label: t("Create Workspace"),
        onClick: onWorkspaceModalOpen,
      });
    }
    return res;
  }, [
    t,
    workspaces,
    profilePictureUrl,
    disableWorkspaceUi,
    personalWorkspace?.id,
    onWorkspaceNavigation,
    onWorkspaceModalOpen,
  ]);

  const AccountItems: MenuProps["items"] = useMemo(
    () => [
      {
        icon: <Icon icon="user" />,
        key: "account-settings",
        label: t("Account Settings"),
        onClick: onNavigateToSettings,
      },
      {
        icon: <Icon icon="logout" />,
        key: "logout",
        label: t("Logout"),
        onClick: logout,
      },
    ],
    [t, onNavigateToSettings, logout],
  );

  return (
    <MainHeader>
      {logoUrl ? (
        <LogoIcon onClick={onHomeNavigation} src={logoUrl} />
      ) : (
        <Logo onClick={onHomeNavigation} src="/logo.svg" />
      )}
      <WorkspaceDropdown
        items={WorkspacesItems}
        name={currentWorkspace?.name}
        personal={currentIsPersonal}
        profilePictureUrl={profilePictureUrl}
        showArrow={true}
        showName={true}
      />
      <CurrentProject>
        {currentProject?.name && (
          <>
            <Break>/</Break>
            <ProjectText>{currentProject.name}</ProjectText>
            {currentProject.accessibility?.visibility === ProjectVisibility.Private && (
              <StyledIcon icon="lock" />
            )}
          </>
        )}
      </CurrentProject>
      <AccountDropdown
        items={AccountItems}
        name={username}
        personal={true}
        profilePictureUrl={profilePictureUrl}
        showArrow={false}
        showName={false}
      />
      {url && (
        <LinkWrapper>
          <EditorLink href={url.href} rel="noreferrer" target="_blank">
            {t("Go to Editor")}
          </EditorLink>
        </LinkWrapper>
      )}
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

  .ant-space-item {
    color: #dbdbdb;
  }
`;

const Logo = styled.img`
  display: inline-block;
  color: #df3013;
  font-weight: 500;
  font-size: 14px;
  line-height: 48px;
  cursor: pointer;
  margin: 0 24px;
`;

const LogoIcon = styled.img`
  width: 100px;
  margin: 0 40px 0 20px;
  cursor: pointer;
`;

const StyledIcon = styled(Icon)`
  margin-left: 4px;
  color: #dbdbdb;
`;

const WorkspaceDropdown = styled(HeaderDropdown)`
  margin-left: 20px;
  padding-left: 20px;
`;

const AccountDropdown = styled(HeaderDropdown)`
  padding-right: 20px;
`;

const ProjectText = styled.p`
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
`;

const Break = styled.p`
  margin: 0 10px 0 10px;
`;

const CurrentProject = styled.div`
  height: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  color: #dbdbdb;
  flex: 1;
  min-width: 0;
`;

const MenuText = styled.p`
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 140px;
`;

const LinkWrapper = styled.div`
  padding-right: 16px;
`;

const EditorLink = styled.a`
  border: 1px solid;
  color: #d9d9d9;
  padding: 5px 16px;
  :hover {
    color: #d9d9d9;
  }
`;

export default HeaderMolecule;
