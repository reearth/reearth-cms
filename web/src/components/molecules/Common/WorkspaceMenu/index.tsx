import { ItemType } from "antd/lib/menu/hooks/useItems";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  inlineCollapsed: boolean;
  isPersonalWorkspace?: boolean;
  workspaceId?: string;
  defaultSelectedKey?: string;
};

export type MenuShowType = "personal" | "notPersonal" | "both";

export type WorkspaceItemType = ItemType & { show: MenuShowType };

const topItems: WorkspaceItemType[] = [
  { label: "Home", key: "home", icon: <Icon icon="home" />, show: "both" },
];

const WorkspaceMenu: React.FC<Props> = ({
  inlineCollapsed,
  isPersonalWorkspace,
  workspaceId,
  defaultSelectedKey,
}) => {
  const t = useT();
  const navigate = useNavigate();
  const [selected, changeSelected] = useState([defaultSelectedKey ?? "home"]);

  const items: WorkspaceItemType[] = [
    {
      label: t("Member"),
      key: "member",
      icon: <Icon icon="userGroupAdd" />,
      show: "notPersonal" as MenuShowType,
    },
    {
      label: t("Account"),
      key: "account",
      icon: <Icon icon="userGroupAdd" />,
      show: "personal" as MenuShowType,
    },
    {
      label: t("Integration"),
      key: "integration",
      icon: <Icon icon="api" />,
      show: "both" as MenuShowType,
    },
    {
      label: t("My Integrations"),
      key: "my-integration",
      icon: <Icon icon="api" />,
      show: "both" as MenuShowType,
    },
    {
      label: t("Role"),
      key: "role",
      icon: <Icon icon="userSwitch" />,
      show: "notPersonal" as MenuShowType,
    },
    {
      label: t("API key"),
      key: "api-key",
      icon: <Icon icon="search" />,
      show: "both" as MenuShowType,
    },
    {
      label: t("Settings"),
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
    changeSelected([e.key]);
    if (e.key === "member") {
      navigate(`/workspace/${workspaceId}/members`);
    } else if (e.key === "dashboard") {
      navigate(`/workspace/${workspaceId}`);
    } else if (e.key === "my-integration") {
      navigate(`/workspace/${workspaceId}/myIntegrations`);
    } else if (e.key === "integration") {
      navigate(`/workspace/${workspaceId}/integration`);
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

export default WorkspaceMenu;
