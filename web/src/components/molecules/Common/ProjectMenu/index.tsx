import { ItemType } from "antd/lib/menu/interface";
import { useCallback, useEffect, useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";

type Props = {
  inlineCollapsed: boolean;
  defaultSelectedKey?: string;
  onNavigate: (info: MenuInfo) => void;
};

const ProjectMenu: React.FC<Props> = ({ inlineCollapsed, defaultSelectedKey, onNavigate }) => {
  const t = useT();

  const topItems: ItemType[] = [
    {
      label: <span data-testid="home-menu-item">{t("Home")}</span>,
      key: "home",
      icon: <Icon icon="home" />,
    },
    {
      label: <span data-testid="overview-menu-item">{t("Overview")}</span>,
      key: "overview",
      icon: <Icon icon="dashboard" />,
    },
    {
      label: <span data-testid="schema-menu-item">{t("Schema")}</span>,
      key: "schema",
      icon: <Icon icon="unorderedList" />,
    },
    {
      label: <span data-testid="content-menu-item">{t("Content")}</span>,
      key: "content",
      icon: <Icon icon="table" />,
    },
    {
      label: <span data-testid="asset-menu-item">{t("Asset")}</span>,
      key: "asset",
      icon: <Icon icon="file" />,
    },
    {
      label: <span data-testid="request-menu-item">{t("Request")}</span>,
      key: "request",
      icon: <Icon icon="pullRequest" />,
    },
  ];
  const [selected, changeSelected] = useState([defaultSelectedKey ?? "overview"]);

  useEffect(() => {
    if (defaultSelectedKey && defaultSelectedKey !== selected[0]) {
      changeSelected([defaultSelectedKey]);
    }
  }, [selected, defaultSelectedKey]);

  const items: ItemType[] = [
    {
      label: <span data-testid="accessibility-menu-item">{t("Accessibility")}</span>,
      key: "accessibility",
      icon: <Icon icon="send" />,
    },
    {
      label: <span data-testid="settings-menu-item">{t("Settings")}</span>,
      key: "settings",
      icon: <Icon icon="settings" />,
    },
  ];

  const onClick = useCallback(
    (info: MenuInfo) => {
      changeSelected([info.key]);
      onNavigate(info);
    },
    [onNavigate],
  );

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
        data-testid="project-menu"
        selectedKeys={selected}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={items}
      />
    </>
  );
};

export default ProjectMenu;
