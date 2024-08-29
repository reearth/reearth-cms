import styled from "@emotion/styled";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  collapsed: boolean;
};

const ModelListBody: React.FC<Props> = ({ children, collapsed }) => {
  return <Container collapsed={collapsed}>{children}</Container>;
};

export default ModelListBody;

const Container = styled.div<{ collapsed: boolean }>`
  overflow-x: hidden;
  overflow-y: auto;
  max-height: ${({ collapsed }) => (collapsed ? "calc(100% - 38px)" : "calc(100% - 60px)")};
`;
