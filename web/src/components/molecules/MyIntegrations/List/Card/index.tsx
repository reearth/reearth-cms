import styled from "@emotion/styled";
import { useCallback } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

type Props = {
  integration: Integration;
  onIntegrationNavigate: (integrationId: string) => void;
};

const MyIntegrationCard: React.FC<Props> = ({ integration, onIntegrationNavigate }) => {
  const onCardClick = useCallback(() => {
    onIntegrationNavigate(integration.id);
  }, [integration, onIntegrationNavigate]);

  return (
    <CardWrapper>
      <Card onClick={onCardClick} role="link">
        <Icon icon="api" size={40} color={AntdColor.NEUTRAL.TEXT_QUATERNARY} />
        <CardTitle>{integration.name}</CardTitle>
        <CardSubTitle>{integration.description}</CardSubTitle>
      </Card>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  padding: ${AntdToken.SPACING.SM}px;
`;

const Card = styled.div`
  height: 180px;
  width: 240px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: ${AntdToken.SPACING.LG}px;
  border: 1px solid ${AntdColor.NEUTRAL.BORDER};
  box-shadow: 0px 2px 8px ${AntdColor.NEUTRAL.FILL};
  border-radius: ${AntdToken.RADIUS.SM}px;
  cursor: pointer;
  &:hover {
    background-color: ${AntdColor.NEUTRAL.BG_LAYOUT};
  }
`;

const CardTitle = styled.h3`
  width: 100%;
  margin-top: 22px;
  margin-bottom: ${AntdToken.SPACING.XXS}px;
  font-weight: 500;
  font-size: ${AntdToken.FONT.SIZE_LG}px;
  line-height: ${AntdToken.LINE_HEIGHT.LG}px;
  color: ${AntdColor.NEUTRAL.TEXT};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const CardSubTitle = styled.h4`
  width: 100%;
  margin: 0;
  font-weight: 400;
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  line-height: ${AntdToken.LINE_HEIGHT.SM}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default MyIntegrationCard;
