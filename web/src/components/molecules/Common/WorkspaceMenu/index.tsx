import styled from "@emotion/styled";
import { ItemType } from "antd/lib/menu/interface";
import { useCallback, useEffect, useMemo, useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

type Props = {
  inlineCollapsed: boolean;
  isPersonalWorkspace: boolean;
  defaultSelectedKey?: string;
  onNavigate: (info: MenuInfo) => void;
};

type MenuShowType = "personal" | "notPersonal" | "both";

type WorkspaceItemType = ItemType & { show: MenuShowType };

const WorkspaceMenu: React.FC<Props> = ({
  inlineCollapsed,
  isPersonalWorkspace,
  defaultSelectedKey,
  onNavigate,
}) => {
  const t = useT();
  const [selected, changeSelected] = useState([defaultSelectedKey ?? "home"]);

  useEffect(() => {
    changeSelected([defaultSelectedKey ?? "home"]);
  }, [defaultSelectedKey]);

  const topItems: WorkspaceItemType[] = [
    {
      label: <span data-testid={DATA_TEST_ID.WorkspaceMenu__HomeItem}>{t("Home")}</span>,
      key: "home",
      icon: <Icon icon="home" />,
      show: "both",
    },
  ];

  const items: WorkspaceItemType[] = useMemo(() => {
    const res = [
      {
        label: <span data-testid={DATA_TEST_ID.WorkspaceMenu__MemberItem}>{t("Member")}</span>,
        key: "members",
        icon: <Icon icon="userGroupAdd" />,
        show: "notPersonal" as MenuShowType,
      },
      {
        label: (
          <span data-testid={DATA_TEST_ID.WorkspaceMenu__IntegrationsItem}>
            {t("Integrations")}
          </span>
        ),
        key: "integrations",
        icon: <Icon icon="api" />,
        show: "both" as MenuShowType,
      },
      {
        label: (
          <span data-testid={DATA_TEST_ID.WorkspaceMenu__MyIntegrationsItem}>
            {t("My Integrations")}
          </span>
        ),
        key: "myIntegrations",
        icon: <Icon icon="myIntegrations" />,
        show: "personal" as MenuShowType,
      },
      {
        label: <span data-testid={DATA_TEST_ID.WorkspaceMenu__SettingsItem}>{t("Settings")}</span>,
        key: "settings",
        icon: <Icon icon="settings" />,
        show: "both" as MenuShowType,
      },
      {
        label: (
          <span data-testid={DATA_TEST_ID.WorkspaceMenu__WorkspaceSettingsItem}>
            {t("Workspace Settings")}
          </span>
        ),
        key: "workspaceSettings",
        icon: <Icon size={"1em"} icon="workspaceSettings" />,
        show: "notPersonal" as MenuShowType,
      },
      {
        label: (
          <span data-testid={DATA_TEST_ID.WorkspaceMenu__AccountSettingsItem}>
            {t("Account Settings")}
          </span>
        ),
        key: "account",
        icon: <Icon icon="user" />,
        show: "personal" as MenuShowType,
      },
    ];

    return res.filter(
      item =>
        (isPersonalWorkspace && item.show === "personal") ||
        (!isPersonalWorkspace && item.show === "notPersonal") ||
        item.show === "both",
    );
  }, [t, isPersonalWorkspace]);

  const onClick = useCallback(
    (info: MenuInfo) => {
      changeSelected([info.key]);
      onNavigate(info);
    },
    [onNavigate],
  );

  return (
    <>
      <StyledMenu
        onClick={onClick}
        selectedKeys={selected}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={topItems}
      />
      <StyledMenu
        onClick={onClick}
        selectedKeys={selected}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={items}
      />
    </>
  );
};

export default WorkspaceMenu;

const StyledMenu = styled(Menu)`
  li {
    padding-left: 16px !important;
  }
`;
