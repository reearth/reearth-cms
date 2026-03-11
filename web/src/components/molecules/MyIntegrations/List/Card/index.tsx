import styled from "@emotion/styled";
import { useCallback } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { AntdColor } from "@reearth-cms/utils/color";

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
  padding: 12px;
`;

const Card = styled.div`
  height: 180px;
  width: 240px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  border: 1px solid ${AntdColor.NEUTRAL.BORDER};
  box-shadow: 0px 2px 8px ${AntdColor.NEUTRAL.FILL};
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: ${AntdColor.NEUTRAL.BG_LAYOUT};
  }
`;

const CardTitle = styled.h3`
  width: 100%;
  margin-top: 22px;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: ${AntdColor.NEUTRAL.TEXT};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const CardSubTitle = styled.h4`
  width: 100%;
  margin: 0;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default MyIntegrationCard;
