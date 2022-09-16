import styled from "@emotion/styled";
import React from "react";

export interface Props {
  src?: string;
  selected?: boolean;
  title: string;
}

const IntegrationCard: React.FC<Props> = ({ src, selected, title }) => {
  return (
    <CardWrapper selected={selected}>
      <CardImg src={src}></CardImg>
      <CardTitle>{title}</CardTitle>
    </CardWrapper>
  );
};

const CardWrapper = styled.div<{ selected?: boolean }>`
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid #f0f0f0;
  padding: 12px;
  min-height: 88px;
  display: flex;
  align-items: center;
  background-color: ${({ selected }) => (selected ? "#E6F7FF" : "#FFF")};
  margin-bottom: 10px;
`;

const CardImg = styled.img`
  width: 64px;
  height: 64px;
`;

const CardTitle = styled.h5`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  margin: 0;
  padding-left: 12px;
`;

export default IntegrationCard;
