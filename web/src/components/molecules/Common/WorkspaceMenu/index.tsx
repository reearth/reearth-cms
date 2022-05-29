import {
  ApiOutlined,
  HomeOutlined,
  SearchOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { isVisible } from "@testing-library/user-event/dist/types/utils";
import { Menu } from "antd";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import React from "react";

export interface Props {
  inlineCollapsed: boolean;
  isPersonalWorkspace?: boolean;
}

function getItem(
  label: string,
  key: string,
  icon: any,
  show?: "personal" | "notPersonal" | "both"
) {
  return {
    key,
    icon,
    label,
    show,
  };
}

const topItems: ItemType[] = [getItem("Home", "home", <HomeOutlined />)];

const WorkspaceMenu: React.FC<Props> = ({
  inlineCollapsed,
  isPersonalWorkspace,
}) => {
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

  return (
    <>
      <Menu
        defaultSelectedKeys={["home"]}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={topItems}
      />
      <Menu
        defaultSelectedKeys={["home"]}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={items}
      />
    </>
  );
};

export default WorkspaceMenu;
