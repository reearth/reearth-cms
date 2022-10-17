import { ItemType } from "antd/lib/menu/hooks/useItems";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  inlineCollapsed: boolean;
  workspaceId?: string;
  projectId?: string;
  defaultSelectedKey?: string;
};

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
  defaultSelectedKey,
}) => {
  const t = useT();
  const navigate = useNavigate();
  const [selected, changeSelected] = useState([defaultSelectedKey ?? "home"]);

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
    changeSelected([e.key]);
    switch (e.key) {
      case "home":
        navigate(`/workspace/${workspaceId}/project/${projectId}`);
        break;
      case "schema":
        navigate(`/workspace/${workspaceId}/project/${projectId}/schema`);
        break;
      case "content":
        navigate(`/workspace/${workspaceId}/project/${projectId}/content`);
        break;
      case "asset":
        navigate(`/workspace/${workspaceId}/project/${projectId}/asset`);
        break;
      case "request":
        navigate(`/workspace/${workspaceId}/project/${projectId}/request`);
        break;
      case "settings":
        navigate(`/workspace/${workspaceId}/project/${projectId}/settings`);
        break;
    }
  };

  return (
    <>
      <Menu
        onClick={onClick}
        selectedKeys={selected}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={topItems}
      />
      <Menu
        onClick={onClick}
        selectedKeys={selected}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={items}
      />
    </>
  );
};

export default ProjectMenu;
