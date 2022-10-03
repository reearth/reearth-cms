import { ItemType } from "antd/lib/menu/hooks/useItems";
import React from "react";
import { useNavigate } from "react-router-dom";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  inlineCollapsed: boolean;
  workspaceId?: string;
  projectId?: string;
  defaultSelectedKeys?: string[];
}

const topItems: ItemType[] = [
  { label: "Overview", key: "home", icon: <Icon icon="dashboard" /> },
  { label: "Schema", key: "schema", icon: <Icon icon="unorderedList" /> },
  { label: "Content", key: "content", icon: <Icon icon="table" /> },
  { label: "Asset", key: "asset", icon: <Icon icon="file" /> },
  { label: "Request", key: "request", icon: <Icon icon="pullRequest" /> },
];

const ProjectMenu: React.FC<Props> = ({
  inlineCollapsed,
  workspaceId,
  projectId,
  defaultSelectedKeys,
}) => {
  const t = useT();
  const navigate = useNavigate();
  const items: ItemType[] = [
    {
      label: t("Accessibility"),
      key: "accessibility",
      icon: <Icon icon="send" />,
    },
    {
      label: t("Settings"),
      key: "settings",
      icon: <Icon icon="settings" />,
    },
  ];

  const onClick = (e: any) => {
    switch (e.key) {
      case "home":
        navigate(`/dashboard/${workspaceId}`);
        break;
      case "schema":
        navigate(`/workspaces/${workspaceId}/${projectId}/schema`);
        break;
      case "settings":
        navigate(`/workspaces/${workspaceId}/${projectId}`);
        break;
      case "asset":
        navigate(`/workspaces/${workspaceId}/${projectId}/asset`);
        break;
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
