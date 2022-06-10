import {
  DashboardOutlined,
  FileOutlined,
  PullRequestOutlined,
  SendOutlined,
  SettingOutlined,
  TableOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import React from "react";
import { useNavigate } from "react-router-dom";

export interface Props {
  inlineCollapsed: boolean;
  workspaceId?: string;
  defaultSelectedKeys?: string[];
}

function getItem(label: string, key: string, icon: any) {
  return {
    key,
    icon,
    label,
  };
}

const topItems: ItemType[] = [
  getItem("Overview", "home", <DashboardOutlined />),
  getItem("Schema", "list", <UnorderedListOutlined />),
  getItem("Content", "content", <TableOutlined />),
  getItem("Asset", "asset", <FileOutlined />),
  getItem("Request", "request", <PullRequestOutlined />),
];

const ProjectMenu: React.FC<Props> = ({
  inlineCollapsed,
  workspaceId,
  defaultSelectedKeys,
}) => {
  const navigate = useNavigate();
  const items: ItemType[] = [
    getItem("Accessibility", "accessibility", <SendOutlined />),
    getItem("Settings", "settings", <SettingOutlined />),
  ];

  const onClick = (e: any) => {
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

export default ProjectMenu;
