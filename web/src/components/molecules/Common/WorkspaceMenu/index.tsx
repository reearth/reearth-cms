import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";

type ItemType = NonNullable<MenuProps["items"]>[number];

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
    { label: t("Home"), key: "home", icon: <Icon icon="home" />, show: "both" },
  ];

  const items = useMemo<WorkspaceItemType[]>(() => {
    const res = [
      {
        label: t("Member"),
        key: "members",
        icon: <Icon icon="userGroupAdd" />,
        show: "notPersonal" as MenuShowType,
      },
      {
        label: t("Integrations"),
        key: "integrations",
        icon: <Icon icon="api" />,
        show: "both" as MenuShowType,
      },
      {
        label: t("My Integrations"),
        key: "myIntegrations",
        icon: <Icon icon="myIntegrations" />,
        show: "personal" as MenuShowType,
      },
      {
        label: t("Settings"),
        key: "settings",
        icon: <Icon icon="settings" />,
        show: "both" as MenuShowType,
      },
      {
        label: t("Workspace Settings"),
        key: "workspaceSettings",
        icon: <Icon size={"1em"} icon="workspaceSettings" />,
        show: "notPersonal" as MenuShowType,
      },
      {
        label: t("Account Settings"),
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
