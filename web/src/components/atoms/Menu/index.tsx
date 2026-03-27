import { Menu, MenuProps } from "antd";

type MenuInfo = {
  key: string;
  keyPath: string[];
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
};

type ItemType = NonNullable<MenuProps["items"]>[number];

export type { MenuInfo, ItemType };

export default Menu;
