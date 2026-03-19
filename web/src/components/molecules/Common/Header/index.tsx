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
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { parseConfigBoolean } from "@reearth-cms/utils/format";

import HeaderDropdown from "./Dropdown";

type Props = {
  username: string;
  profilePictureUrl?: string;
  personalWorkspace?: Workspace;
  currentWorkspace?: Workspace;
  workspaces?: Workspace[];
  currentProject?: Project;
  onWorkspaceModalOpen: () => void;
  onNavigateToSettings: () => void;
  onWorkspaceNavigation: (id: string) => void;
  onHomeNavigation: () => void;
  logoUrl?: string;
};

const HeaderMolecule: React.FC<Props> = ({
  username,
  profilePictureUrl,
  personalWorkspace,
  currentWorkspace,
  workspaces,
  currentProject,
  onWorkspaceModalOpen,
  onNavigateToSettings,
  onWorkspaceNavigation,
  onHomeNavigation,
  logoUrl,
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
        label: t("Personal Account"),
        key: "personal-account",
        type: "group",
        children: workspaces
          ?.filter(workspace => workspace.id === personalWorkspace?.id)
          ?.map(workspace => ({
            label: (
              <Tooltip title={workspace.name} placement="right">
                <MenuText>{workspace.name}</MenuText>
              </Tooltip>
            ),
            key: workspace.id,
            icon: (
              <UserAvatar
                profilePictureUrl={profilePictureUrl}
                username={workspace.name}
                size="small"
              />
            ),
            style: { paddingLeft: 0, paddingRight: 0 },
            onClick: () => onWorkspaceNavigation(workspace.id),
          })),
      },
      {
        type: "divider",
      },
      {
        label: t("Workspaces"),
        key: "workspaces",
        type: "group",
        children: workspaces
          ?.filter(workspace => workspace.id !== personalWorkspace?.id)
          ?.map(workspace => ({
            label: (
              <Tooltip title={workspace.name} placement="right">
                <MenuText>{workspace.name}</MenuText>
              </Tooltip>
            ),
            key: workspace.id,
            icon: <UserAvatar username={workspace.name} size="small" shape="square" />,
            style: { paddingLeft: 0, paddingRight: 0 },
            onClick: () => onWorkspaceNavigation(workspace.id),
          })),
      },
    ];
    if (!disableWorkspaceUi) {
      res.push({
        label: t("Create Workspace"),
        key: "new-workspace",
        icon: <Icon icon="userGroupAdd" />,
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
    ],
    [t, onNavigateToSettings, logout],
  );

  return (
    <MainHeader>
      {logoUrl ? (
        <LogoIcon src={logoUrl} onClick={onHomeNavigation} />
      ) : (
        <Logo src="/logo.svg" onClick={onHomeNavigation} />
      )}
      <WorkspaceDropdown
        name={currentWorkspace?.name}
        profilePictureUrl={profilePictureUrl}
        items={WorkspacesItems}
        personal={currentIsPersonal}
        showName={true}
        showArrow={true}
      />
      <CurrentProject>
        {currentProject?.name && (
          <>
            <Break>/</Break>
            <ProjectText data-testid={DATA_TEST_ID.Header__ProjectName}>
              {currentProject.name}
            </ProjectText>
            {currentProject.accessibility?.visibility === ProjectVisibility.Private && (
              <StyledIcon icon="lock" />
            )}
          </>
        )}
      </CurrentProject>
      <AccountDropdown
        name={username}
        profilePictureUrl={profilePictureUrl}
        items={AccountItems}
        personal={true}
        showName={false}
        showArrow={false}
      />
      {url && (
        <LinkWrapper>
          <EditorLink rel="noreferrer" href={url.href} target="_blank">
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
