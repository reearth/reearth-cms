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

const topItems: ItemType[] = [
  { label: "Overview", key: "home", icon: <DashboardOutlined /> },
  { label: "Schema", key: "list", icon: <UnorderedListOutlined /> },
  { label: "Content", key: "content", icon: <TableOutlined /> },
  { label: "Asset", key: "asset", icon: <FileOutlined /> },
  { label: "Request", key: "request", icon: <PullRequestOutlined /> },
];

const ProjectMenu: React.FC<Props> = ({
  inlineCollapsed,
  workspaceId,
  defaultSelectedKeys,
}) => {
  const navigate = useNavigate();
  const items: ItemType[] = [
    { label: "Accessibility", key: "accessibility", icon: <SendOutlined /> },
    { label: "Settings", key: "settings", icon: <SettingOutlined /> },
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
