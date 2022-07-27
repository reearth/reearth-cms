import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import React from "react";
import { useNavigate } from "react-router-dom";

export interface Props {
  inlineCollapsed: boolean;
  workspaceId?: string;
  defaultSelectedKeys?: string[];
}

const topItems: ItemType[] = [
  { label: "Overview", key: "home", icon: <Icon.dashboard /> },
  { label: "Schema", key: "list", icon: <Icon.unorderedList /> },
  { label: "Content", key: "content", icon: <Icon.table /> },
  { label: "Asset", key: "asset", icon: <Icon.file /> },
  { label: "Request", key: "request", icon: <Icon.pullRequest /> },
];

const ProjectMenu: React.FC<Props> = ({
  inlineCollapsed,
  workspaceId,
  defaultSelectedKeys,
}) => {
  const navigate = useNavigate();
  const items: ItemType[] = [
    { label: "Accessibility", key: "accessibility", icon: <Icon.send /> },
    { label: "Settings", key: "settings", icon: <Icon.settings /> },
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
