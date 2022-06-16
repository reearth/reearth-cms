import styled from "@emotion/styled";
import { CSSProperties, ReactNode } from "react";

type CardProps = {
  title: string;
  children?: ReactNode;
  style?: CSSProperties;
};

const Card: React.FC<CardProps> = ({ title, children, style }) => {
  return (
    <CardWrapper style={style}>
      <CardHeader>
        <h5>{title}</h5>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </CardWrapper>
  );
};

const CardWrapper = styled("div")`
  padding: 0;
  border: 1px solid #f5f5f5;
`;

const CardHeader = styled("div")`
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 24px;
`;

const CardBody = styled("div")`
  padding: 10px;
  background-color: #f5f5f5;
`;

export default Card;
