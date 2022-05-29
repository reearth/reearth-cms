import { userInfo } from "os";

import styled from "@emotion/styled";
import Avatar from "@reearth-cms/components/atoms/Avatar";
import React from "react";
import { useNavigate } from "react-router-dom";

import type { User, Team, Project } from "./types";

export type { User, Team, Project } from "./types";

export interface Props {
  user: User;
}

const Header: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  return (
    <>
      <Logo onClick={() => navigate("/")}>Re:Earth CMS</Logo>
      <Spacer></Spacer>
      <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }}>
        {user.name.charAt(0)}
      </Avatar>
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

export default Header;
