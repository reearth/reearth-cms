import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";

type Props = {
  name: string;
  isSelected: boolean;
  onClick: () => void;
};

const IntegrationCard: React.FC<Props> = ({ name, isSelected, onClick }) => (
  <CardWrapper onClick={onClick} isSelected={isSelected} data-testid="integration">
    <Icon icon="api" size={64} color="#00000040" />
    <CardTitle>{name}</CardTitle>
  </CardWrapper>
);

const CardWrapper = styled.div<{ isSelected: boolean }>`
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

const CardTitle = styled.h3`
  font-weight: 500;
  font-size: 16px;
  margin: 0;
  padding-left: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export default IntegrationCard;
