import styled from "@emotion/styled";

import { Integration } from "@reearth-cms/components/molecules/Integration/types";

export type Props = {
  integration: Integration;
  integrationSelected: boolean;
  onClick: () => void;
};

const IntegrationCard: React.FC<Props> = ({ integration, integrationSelected, onClick }) => (
  <CardWrapper onClick={onClick} isSelected={integrationSelected}>
    <CardImg src={integration.logoUrl} />
    <CardTitle>{integration.name}</CardTitle>
  </CardWrapper>
);

const CardWrapper = styled.div<{ isSelected?: boolean }>`
  cursor: pointer;
  box-shadow: 0px 2px 8px #00000026;
  border: 1px solid #f0f0f0;
  padding: 12px;
  min-height: 88px;
  display: flex;
  align-items: center;
  background-color: ${({ isSelected }) => (isSelected ? "#E6F7FF" : "#FFF")};
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
