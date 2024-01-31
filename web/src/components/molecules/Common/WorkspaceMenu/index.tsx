import { ItemType } from "antd/lib/menu/hooks/useItems";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  inlineCollapsed: boolean;
  isPersonalWorkspace?: boolean;
  selectedKeys?: string[];
  onNavigate?: (info: MenuInfo) => void;
};

export type MenuShowType = "personal" | "notPersonal" | "both";

export type WorkspaceItemType = ItemType & { show: MenuShowType };

const WorkspaceMenu: React.FC<Props> = ({
  inlineCollapsed,
  isPersonalWorkspace,
  selectedKeys,
  onNavigate,
}) => {
  const t = useT();

  const topItems: WorkspaceItemType[] = [
    { label: t("Home"), key: "home", icon: <Icon icon="home" />, show: "both" },
  ];

  const items: WorkspaceItemType[] = [
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
      label: t("Workspace"),
      key: "workspaceSettings",
      icon: <Icon icon="workspaceSettings" />,
      show: "notPersonal" as MenuShowType,
    },
    {
      label: t("Account"),
      key: "account",
      icon: <Icon icon="user" />,
      show: "personal" as MenuShowType,
    },
  ].filter(
    item =>
      (isPersonalWorkspace && item.show === "personal") ||
      (!isPersonalWorkspace && item.show === "notPersonal") ||
      item.show === "both",
  );

  return (
    <>
      <Menu
        onClick={onNavigate}
        selectedKeys={selectedKeys}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={topItems}
      />
      <Menu
        onClick={onNavigate}
        selectedKeys={selectedKeys}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={items}
      />
    </>
  );
};

export default WorkspaceMenu;
