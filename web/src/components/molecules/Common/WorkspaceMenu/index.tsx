import styled from "@emotion/styled";
import { ItemType } from "antd/lib/menu/interface";
import { useCallback, useEffect, useMemo, useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";

type Props = {
  defaultSelectedKey?: string;
  inlineCollapsed: boolean;
  isPersonalWorkspace: boolean;
  onNavigate: (info: MenuInfo) => void;
};

type MenuShowType = "both" | "notPersonal" | "personal";

type WorkspaceItemType = { show: MenuShowType } & ItemType;

const WorkspaceMenu: React.FC<Props> = ({
  defaultSelectedKey,
  inlineCollapsed,
  isPersonalWorkspace,
  onNavigate,
}) => {
  const t = useT();
  const [selected, changeSelected] = useState([defaultSelectedKey ?? "home"]);

  useEffect(() => {
    changeSelected([defaultSelectedKey ?? "home"]);
  }, [defaultSelectedKey]);

  const topItems: WorkspaceItemType[] = [
    { icon: <Icon icon="home" />, key: "home", label: t("Home"), show: "both" },
  ];

  const items: WorkspaceItemType[] = useMemo(() => {
    const res = [
      {
        icon: <Icon icon="userGroupAdd" />,
        key: "members",
        label: t("Member"),
        show: "notPersonal" as MenuShowType,
      },
      {
        icon: <Icon icon="api" />,
        key: "integrations",
        label: t("Integrations"),
        show: "both" as MenuShowType,
      },
      {
        icon: <Icon icon="myIntegrations" />,
        key: "myIntegrations",
        label: t("My Integrations"),
        show: "personal" as MenuShowType,
      },
      {
        icon: <Icon icon="settings" />,
        key: "settings",
        label: t("Settings"),
        show: "both" as MenuShowType,
      },
      {
        icon: <Icon icon="workspaceSettings" size={"1em"} />,
        key: "workspaceSettings",
        label: t("Workspace Settings"),
        show: "notPersonal" as MenuShowType,
      },
      {
        icon: <Icon icon="user" />,
        key: "account",
        label: t("Account Settings"),
        show: "personal" as MenuShowType,
      },
    ];

    return res.filter(
      item =>
        (isPersonalWorkspace && item.show === "personal") ||
        (!isPersonalWorkspace && item.show === "notPersonal") ||
        item.show === "both",
    );
  }, [t, isPersonalWorkspace]);

  const onClick = useCallback(
    (info: MenuInfo) => {
      changeSelected([info.key]);
      onNavigate(info);
    },
    [onNavigate],
  );

  return (
    <>
      <StyledMenu
        inlineCollapsed={inlineCollapsed}
        items={topItems}
        mode="inline"
        onClick={onClick}
        selectedKeys={selected}
      />
      <StyledMenu
        inlineCollapsed={inlineCollapsed}
        items={items}
        mode="inline"
        onClick={onClick}
        selectedKeys={selected}
      />
    </>
  );
};

export default WorkspaceMenu;

const StyledMenu = styled(Menu)`
  li {
    padding-left: 16px !important;
  }
`;
