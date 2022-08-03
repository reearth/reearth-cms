import { ItemType } from "antd/lib/menu/hooks/useItems";
import React from "react";
import { useNavigate } from "react-router-dom";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";

export interface Props {
  inlineCollapsed: boolean;
  workspaceId?: string;
  defaultSelectedKeys?: string[];
}

const topItems: ItemType[] = [
  { label: "Overview", key: "home", icon: <Icon icon="dashboard" /> },
  { label: "Schema", key: "list", icon: <Icon icon="unorderedList" /> },
  { label: "Content", key: "content", icon: <Icon icon="table" /> },
  { label: "Asset", key: "asset", icon: <Icon icon="file" /> },
  { label: "Request", key: "request", icon: <Icon icon="pullRequest" /> },
];

const ProjectMenu: React.FC<Props> = ({ inlineCollapsed, workspaceId, defaultSelectedKeys }) => {
  const navigate = useNavigate();
  const items: ItemType[] = [
    {
      label: "Accessibility",
      key: "accessibility",
      icon: <Icon icon="send" />,
    },
    {
      label: "Settings",
      key: "settings",
      icon: <Icon icon="settings" />,
    },
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
