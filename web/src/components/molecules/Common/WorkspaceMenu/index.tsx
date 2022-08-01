import { ItemType } from "antd/lib/menu/hooks/useItems";
import React from "react";
import { useNavigate } from "react-router-dom";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";

export interface Props {
  inlineCollapsed: boolean;
  isPersonalWorkspace?: boolean;
  workspaceId?: string;
  defaultSelectedKeys?: string[];
}

export type MenuShowType = "personal" | "notPersonal" | "both";

export type WorkspaceItemType = ItemType & { show: MenuShowType };

const topItems: WorkspaceItemType[] = [
  { label: "Home", key: "home", icon: <Icon icon="home" />, show: "both" },
];

const WorkspaceMenu: React.FC<Props> = ({
  inlineCollapsed,
  isPersonalWorkspace,
  workspaceId,
  defaultSelectedKeys,
}) => {
  const navigate = useNavigate();
  const items: WorkspaceItemType[] = [
    {
      label: "Member",
      key: "member",
      icon: <Icon icon="userGroupAdd" />,
      show: "notPersonal" as MenuShowType,
    },
    {
      label: "Account",
      key: "account",
      icon: <Icon icon="userGroupAdd" />,
      show: "personal" as MenuShowType,
    },
    {
      label: "Integration",
      key: "integration",
      icon: <Icon icon="api" />,
      show: "both" as MenuShowType,
    },
    {
      label: "Role",
      key: "role",
      icon: <Icon icon="userSwitch" />,
      show: "notPersonal" as MenuShowType,
    },
    {
      label: "API key",
      key: "api-key",
      icon: <Icon icon="search" />,
      show: "both" as MenuShowType,
    },
    {
      label: "Settings",
      key: "settings",
      icon: <Icon icon="settings" />,
      show: "notPersonal" as MenuShowType,
    },
  ].filter(
    item =>
      (isPersonalWorkspace && item.show === "personal") ||
      (!isPersonalWorkspace && item.show === "notPersonal") ||
      item.show === "both",
  );

  const onClick = (e: any) => {
    if (e.key === "member") {
      navigate(`/workspaces/${workspaceId}/members`);
    } else if (e.key === "home") {
      navigate(`/dashboard/${workspaceId}`);
    }
  };

  return (
    <>
      <Menu
        onClick={onClick}
        defaultSelectedKeys={defaultSelectedKeys}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={topItems}
      />
      <Menu
        onClick={onClick}
        defaultSelectedKeys={defaultSelectedKeys}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={items}
      />
    </>
  );
};

export default WorkspaceMenu;
