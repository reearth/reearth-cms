import styled from "@emotion/styled";
import { ReactNode } from "react";

export type Props = {
  children?: ReactNode;
};

const WorkspaceWrapper: React.FC<Props> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

const Wrapper = styled.div`
  background-color: #fff;
  margin: 16px;
  min-height: 100%;
`;

export default WorkspaceWrapper;
