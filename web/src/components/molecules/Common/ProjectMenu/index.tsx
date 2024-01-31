import { ItemType } from "antd/lib/menu/hooks/useItems";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  inlineCollapsed: boolean;
  selectedKeys?: string[];
  onNavigate?: (info: MenuInfo) => void;
};

const ProjectMenu: React.FC<Props> = ({ inlineCollapsed, selectedKeys, onNavigate }) => {
  const t = useT();

  const topItems: ItemType[] = [
    { label: t("Overview"), key: "home", icon: <Icon icon="dashboard" /> },
    { label: t("Schema"), key: "schema", icon: <Icon icon="unorderedList" /> },
    { label: t("Content"), key: "content", icon: <Icon icon="table" /> },
    { label: t("Asset"), key: "asset", icon: <Icon icon="file" /> },
    { label: t("Request"), key: "request", icon: <Icon icon="pullRequest" /> },
  ];

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

  return (
    <>
      <Menu
        onClick={onNavigate}
        selectedKeys={selectedKeys}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={topItems}
      />
      <Menu
        onClick={onNavigate}
        selectedKeys={selectedKeys}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={items}
      />
    </>
  );
};

export default ProjectMenu;
