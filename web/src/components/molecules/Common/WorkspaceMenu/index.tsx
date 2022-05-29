import {
  ApiOutlined,
  HomeOutlined,
  SearchOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import styled from "@emotion/styled";
import { Menu } from "antd";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import React from "react";
import { useNavigate } from "react-router-dom";

export interface Props {
  inlineCollapsed: boolean;
}

function getItem(label: string, key: string, icon: any) {
  return {
    key,
    icon,
    label,
  };
}

const topItems: ItemType[] = [getItem("Home", "home", <HomeOutlined />)];

const items: ItemType[] = [
  getItem("Member", "member", <UsergroupAddOutlined />),
  getItem("Integration", "integration", <ApiOutlined />),
  getItem("Role", "role", <UserSwitchOutlined />),
  getItem("API key", "api-key", <SearchOutlined />),
  getItem("Settings", "settings", <SettingOutlined />),
];

const WorkspaceMenu: React.FC<Props> = ({ inlineCollapsed }) => {
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
