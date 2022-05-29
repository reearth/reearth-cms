import {
  CaretDownOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styled from "@emotion/styled";
import { useAuth } from "@reearth-cms/auth";
import Avatar from "@reearth-cms/components/atoms/Avatar";
import { Menu, Space } from "antd";
import Dropdown from "antd/lib/dropdown/dropdown";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import type { User } from "./types";

export type { User } from "./types";

export interface Props {
  user: User;
}

const Header: React.FC<Props> = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const menu = (
    <AccountMenu
      style={{ color: "#fff" }}
      items={[
        {
          label: "Account Settings",
          key: "account-settings",
          icon: <UserOutlined />,
        },
        {
          label: "Logout",
          key: "logout",
          icon: <LogoutOutlined />,
          onClick: () => handleLogout(),
        },
      ]}
    />
  );

  return (
    <>
      <Logo onClick={() => navigate("/")}>Re:Earth CMS</Logo>
      <Spacer></Spacer>
      <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }}>
        {user.name.charAt(0)}
      </Avatar>
      <AccountDropdown overlay={menu}>
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            {user.name}
            <CaretDownOutlined />
          </Space>
        </a>
      </AccountDropdown>
    </>
  );
};

const Logo = styled.div`
  display: inline-block;
  color: #df3013;
  font-weight: 500;
  font-size: 14px;
  line-height: 48px;
  cursor: pointer;
`;

const Spacer = styled.div`
  flex: 1;
`;

const AccountMenu = styled(Menu)`
  background-color: #1d1d1d;
  .ant-dropdown-menu-item,
  .ant-dropdown-menu-submenu-title {
    color: #dbdbdb;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    &:hover {
      background-color: #1d1d1d;
      color: #fff;
    }
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const AccountDropdown = styled(Dropdown)`
  padding-left: 10px;
  color: #fff;
  background-color: #141414;
`;

export default Header;
