import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

export type Props = {
  onIntegrationModalOpen: () => void;
};

const IntegrationCreationAction: React.FC<Props> = ({ onIntegrationModalOpen }) => {
  const t = useT();

  return (
    <CardWrapper>
      <Card onClick={onIntegrationModalOpen}>
        <StyledIcon icon="plus" />
        <CardTitle>{t("Create new integration")}</CardTitle>
      </Card>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  padding: ${AntdToken.SPACING.SM}px;
`;

const StyledIcon = styled(Icon)`
  font-size: 36px;
`;

const Card = styled.button`
  justify-content: center;
  height: 180px;
  width: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${AntdToken.SPACING.LG}px;
  border: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  box-shadow: 0px 2px 8px ${AntdColor.NEUTRAL.FILL};
  border-radius: ${AntdToken.RADIUS.SM}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  cursor: pointer;
  background-color: ${AntdColor.NEUTRAL.BG_WHITE};
  &:hover {
    color: ${AntdColor.BLUE.BLUE_5};
    background-color: ${AntdColor.BLUE.BLUE_0}; /* originally #E6F7FF */
  }
`;

const CardTitle = styled.p`
  margin-top: ${AntdToken.SPACING.XS}px;
  font-weight: 500;
  font-size: ${AntdToken.FONT.SIZE}px;
  line-height: ${AntdToken.LINE_HEIGHT.BASE}px;
`;

export default IntegrationCreationAction;
