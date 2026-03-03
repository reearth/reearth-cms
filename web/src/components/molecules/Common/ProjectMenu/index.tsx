import { ItemType } from "antd/lib/menu/interface";
import { useCallback, useEffect, useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";

type Props = {
  defaultSelectedKey?: string;
  inlineCollapsed: boolean;
  onNavigate: (info: MenuInfo) => void;
};

const ProjectMenu: React.FC<Props> = ({ defaultSelectedKey, inlineCollapsed, onNavigate }) => {
  const t = useT();

  const topItems: ItemType[] = [
    { icon: <Icon icon="block" />, key: "models", label: t("Models") },
    { icon: <Icon icon="unorderedList" />, key: "schema", label: t("Schema") },
    { icon: <Icon icon="table" />, key: "content", label: t("Content") },
    { icon: <Icon icon="file" />, key: "asset", label: t("Asset") },
    { icon: <Icon icon="pullRequest" />, key: "request", label: t("Request") },
  ];
  const [selected, changeSelected] = useState([defaultSelectedKey ?? "models"]);

  useEffect(() => {
    if (defaultSelectedKey && defaultSelectedKey !== selected[0]) {
      changeSelected([defaultSelectedKey]);
    }
  }, [selected, defaultSelectedKey]);

  const items: ItemType[] = [
    {
      icon: <Icon icon="send" />,
      key: "accessibility",
      label: t("Accessibility"),
    },
    {
      icon: <Icon icon="read" />,
      key: "readme",
      label: t("Readme"),
    },
    {
      icon: <Icon icon="copyright" />,
      key: "license",
      label: t("License"),
    },
    {
      icon: <Icon icon="settings" />,
      key: "settings",
      label: t("Settings"),
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
        inlineCollapsed={inlineCollapsed}
        items={topItems}
        mode="inline"
        onClick={onClick}
        selectedKeys={selected}
      />
      <Menu
        inlineCollapsed={inlineCollapsed}
        items={items}
        mode="inline"
        onClick={onClick}
        selectedKeys={selected}
      />
    </>
  );
};

export default ProjectMenu;
