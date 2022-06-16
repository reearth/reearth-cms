import {
  ApiOutlined,
  HomeOutlined,
  SearchOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import React from "react";
import { useNavigate } from "react-router-dom";

export interface Props {
  inlineCollapsed: boolean;
  isPersonalWorkspace?: boolean;
  workspaceId?: string;
  defaultSelectedKeys?: string[];
}

function getItem(
  label: string,
  key: string,
  icon: any,
  show: "personal" | "notPersonal" | "both"
) {
  return {
    key,
    icon,
    label,
    show,
  };
}

const topItems: ItemType[] = [
  getItem("Home", "home", <HomeOutlined />, "both"),
];

const WorkspaceMenu: React.FC<Props> = ({
  inlineCollapsed,
  isPersonalWorkspace,
  workspaceId,
  defaultSelectedKeys,
}) => {
  const navigate = useNavigate();
  const items: ItemType[] = [
    getItem("Member", "member", <UsergroupAddOutlined />, "notPersonal"),
    getItem("Account", "account", <UsergroupAddOutlined />, "personal"),
    getItem("Integration", "integration", <ApiOutlined />, "both"),
    getItem("Role", "role", <UserSwitchOutlined />, "notPersonal"),
    getItem("API key", "api-key", <SearchOutlined />, "both"),
    getItem("Settings", "settings", <SettingOutlined />, "notPersonal"),
  ].filter(
    (item) =>
      (isPersonalWorkspace && item.show === "personal") ||
      (!isPersonalWorkspace && item.show === "notPersonal") ||
      item.show === "both"
  );

  const onClick = (e: any) => {
    if (e.key === "member") {
      navigate(`/workspaces/${workspaceId}/members`);
    }
    if (e.key === "home") {
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
