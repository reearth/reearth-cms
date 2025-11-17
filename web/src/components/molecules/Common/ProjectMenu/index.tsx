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
      label: <span data-testid="nav-models-menuitem">{t("Models")}</span>,
      key: "models",
      icon: <Icon icon="block" />,
    },
    {
      label: <span data-testid="nav-schema-menuitem">{t("Schema")}</span>,
      key: "schema",
      icon: <Icon icon="unorderedList" />,
    },
    {
      label: <span data-testid="nav-content-menuitem">{t("Content")}</span>,
      key: "content",
      icon: <Icon icon="table" />,
    },
    {
      label: <span data-testid="nav-asset-menuitem">{t("Asset")}</span>,
      key: "asset",
      icon: <Icon icon="file" />,
    },
    {
      label: <span data-testid="nav-request-menuitem">{t("Request")}</span>,
      key: "request",
      icon: <Icon icon="pullRequest" />,
    },
  ];
  const [selected, changeSelected] = useState([defaultSelectedKey ?? "models"]);

  useEffect(() => {
    if (defaultSelectedKey && defaultSelectedKey !== selected[0]) {
      changeSelected([defaultSelectedKey]);
    }
  }, [selected, defaultSelectedKey]);

  const items: ItemType[] = [
    {
      label: <span data-testid="nav-accessibility-menuitem">{t("Accessibility")}</span>,
      key: "accessibility",
      icon: <Icon icon="send" />,
    },
    {
      label: <span data-testid="nav-readme-menuitem">{t("Readme")}</span>,
      key: "readme",
      icon: <Icon icon="read" />,
    },
    {
      label: <span data-testid="nav-license-menuitem">{t("License")}</span>,
      key: "license",
      icon: <Icon icon="copyright" />,
    },
    {
      label: <span data-testid="nav-settings-menuitem">{t("Settings")}</span>,
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
        data-testid="project-menu-top"
      />
      <Menu
        onClick={onClick}
        selectedKeys={selected}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={items}
        data-testid="project-menu-bottom"
      />
    </>
  );
};

export default ProjectMenu;
