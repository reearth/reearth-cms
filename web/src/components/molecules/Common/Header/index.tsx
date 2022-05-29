import styled from "@emotion/styled";
import React from "react";
import { useNavigate } from "react-router-dom";

import type { User, Team, Project } from "./types";

export type { User, Team, Project } from "./types";

export interface Props {}

const Header: React.FC<Props> = ({}) => {
  const navigate = useNavigate();
  return (
    <>
      <Logo onClick={() => navigate("/")}>Re:Earth CMS</Logo>
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

export default Header;
