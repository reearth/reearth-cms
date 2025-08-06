import { ItemType } from "antd/lib/menu/interface";
import { useCallback, useEffect, useMemo, useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";
import { parseConfigBoolean } from "@reearth-cms/utils/format";

type Props = {
  inlineCollapsed: boolean;
  isPersonalWorkspace: boolean;
  defaultSelectedKey?: string;
  onNavigate: (info: MenuInfo) => void;
};

type MenuShowType = "personal" | "notPersonal" | "both";

type WorkspaceItemType = ItemType & { show: MenuShowType; order: number };

const WorkspaceMenu: React.FC<Props> = ({
  inlineCollapsed,
  isPersonalWorkspace,
  defaultSelectedKey,
  onNavigate,
}) => {
  const t = useT();
  const [selected, changeSelected] = useState([defaultSelectedKey ?? "home"]);

  useEffect(() => {
    changeSelected([defaultSelectedKey ?? "home"]);
  }, [defaultSelectedKey]);

  const topItems: WorkspaceItemType[] = [
    { label: t("Home"), key: "home", icon: <Icon icon="home" />, show: "both", order: 1 },
  ];

  const disableWorkspaceUi = parseConfigBoolean(window.REEARTH_CONFIG?.disableWorkspaceUi);
  const items: WorkspaceItemType[] = useMemo(() => {
    const res = [
      {
        label: t("Integrations"),
        key: "integrations",
        icon: <Icon icon="api" />,
        show: "both" as MenuShowType,
        order: 3,
      },
      {
        label: t("My Integrations"),
        key: "myIntegrations",
        icon: <Icon icon="myIntegrations" />,
        show: "personal" as MenuShowType,
        order: 4,
      },
      {
        label: t("Settings"),
        key: "settings",
        icon: <Icon icon="settings" />,
        show: "both" as MenuShowType,
        order: 5,
      },
    ];
    if (!disableWorkspaceUi) {
      res.push({
        label: t("Member"),
        key: "members",
        icon: <Icon icon="userGroupAdd" />,
        show: "notPersonal" as MenuShowType,
        order: 2,
      });
      res.push({
        label: t("Workspace"),
        key: "workspaceSettings",
        icon: <Icon size={"1em"} icon="workspaceSettings" />,
        show: "notPersonal" as MenuShowType,
        order: 6,
      });
      res.push({
        label: t("Account"),
        key: "account",
        icon: <Icon icon="user" />,
        show: "personal" as MenuShowType,
        order: 7,
      });
    }

    return res
      .filter(
        item =>
          (isPersonalWorkspace && item.show === "personal") ||
          (!isPersonalWorkspace && item.show === "notPersonal") ||
          item.show === "both",
      )
      .sort((a, b) => a.order - b.order);
  }, [t, isPersonalWorkspace, disableWorkspaceUi]);

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
        selectedKeys={selected}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={items}
      />
    </>
  );
};

export default WorkspaceMenu;
