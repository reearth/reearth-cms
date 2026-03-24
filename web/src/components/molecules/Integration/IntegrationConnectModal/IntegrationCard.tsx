import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

type Props = {
  name: string;
  isSelected: boolean;
  onClick: () => void;
};

const IntegrationCard: React.FC<Props> = ({ name, isSelected, onClick }) => (
  <CardWrapper onClick={onClick} isSelected={isSelected} data-testid="integration">
    <Icon icon="api" size={64} color={AntdColor.NEUTRAL.TEXT_QUATERNARY} />
    <CardTitle>{name}</CardTitle>
  </CardWrapper>
);

const CardWrapper = styled.div<{ isSelected: boolean }>`
  cursor: pointer;
  box-shadow: 0px 2px 8px ${AntdColor.NEUTRAL.FILL};
  border: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  padding: ${AntdToken.SPACING.SM}px;
  min-height: 88px;
  display: flex;
  align-items: center;
  background-color: ${({ isSelected }) =>
    isSelected ? AntdColor.BLUE.BLUE_0 /* originally #E6F7FF */ : AntdColor.NEUTRAL.BG_WHITE};
  margin-bottom: 10px;
`;

const CardTitle = styled.h3`
  font-weight: ${AntdToken.FONT_WEIGHT.MEDIUM};
  font-size: ${AntdToken.FONT.SIZE_LG}px;
  margin: 0;
  padding-left: ${AntdToken.SPACING.SM}px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export default IntegrationCard;
