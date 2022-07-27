import Menu from "@reearth-cms/components/atoms/Menu";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import React from "react";

export interface Props {
  inlineCollapsed: boolean;
  workspaceId?: string;
  defaultSelectedKeys?: string[];
  topItems?: ItemType[];
  bottomItems?: ItemType[];
}

// const topItems: ItemType[] = [
//   { label: "Overview", key: "home", icon: <DashboardOutlined /> },
//   { label: "Schema", key: "list", icon: <UnorderedListOutlined /> },
//   { label: "Content", key: "content", icon: <TableOutlined /> },
//   { label: "Asset", key: "asset", icon: <FileOutlined /> },
//   { label: "Request", key: "request", icon: <PullRequestOutlined /> },
// ];

const SideMenu: React.FC<Props> = ({
  inlineCollapsed,
  defaultSelectedKeys,
  topItems,
  bottomItems,
}) => {
  //   const items: ItemType[] = [
  //     { label: "Accessibility", key: "accessibility", icon: <SendOutlined /> },
  //     { label: "Settings", key: "settings", icon: <SettingOutlined /> },
  //   ];

  //   const onClick = (e: any) => {
  //     if (e.key === "home") {
  //       navigate(`/dashboard/${workspaceId}`);
  //     }
  //   };

  return (
    <>
      <Menu
        onClick={() => {}}
        defaultSelectedKeys={defaultSelectedKeys}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={topItems}
      />
      <Menu
        onClick={() => {}}
        defaultSelectedKeys={defaultSelectedKeys}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={bottomItems}
      />
    </>
  );
};

export default SideMenu;
