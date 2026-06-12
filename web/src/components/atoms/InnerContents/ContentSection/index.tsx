import styled from "@emotion/styled";
import { ReactNode } from "react";

import Flex from "@reearth-cms/components/atoms/Flex";
import { AntdColor, AntdToken, CustomColor } from "@reearth-cms/utils/style";

type Props = {
  title?: string;
  danger?: boolean;
  headerActions?: ReactNode;
  children?: ReactNode;
  description?: string;
  hasPadding?: boolean;
  hasHorizontalRule?: boolean;
  hasGap?: boolean;
};

const ContentSection: React.FC<Props> = ({
  title,
  headerActions,
  children,
  danger,
  description,
  hasPadding = true,
  hasHorizontalRule = true,
  hasGap = false,
}) => {
  const hasHeader = !!(title || description || headerActions);

  return (
    <Wrapper danger={danger}>
      {hasHeader && (
        <Header
          flex="flex-wrap"
          justify="space-between"
          align="center"
          hasHorizontalRule={hasHorizontalRule}>
          <div>
            {title && <Title>{title}</Title>}
            {description && <Description>{description}</Description>}
          </div>
          <div>{headerActions}</div>
        </Header>
      )}
      <GridArea hasPadding={hasPadding} hasGap={hasGap}>
        {children}
      </GridArea>
    </Wrapper>
  );
};

export default ContentSection;

const Wrapper = styled.div<{ danger?: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${AntdColor.NEUTRAL.BG_WHITE};
  color: ${AntdColor.NEUTRAL.TEXT};
  ${({ danger }) => danger && `border: 1px solid ${AntdColor.RED.RED_4};`}
`;

const Header = styled(Flex)<{ hasHorizontalRule?: boolean }>`
  border-bottom: ${({ hasHorizontalRule }) =>
    hasHorizontalRule ? `1px solid ${CustomColor.BORDER_SUBTLE}` : "none"};
  padding: ${({ hasHorizontalRule }) => `10px ${hasHorizontalRule ? AntdToken.SPACING.LG : 0}px`};
  gap: ${AntdToken.SPACING.BASE}px;
`;

const Title = styled.p`
  font-size: ${AntdToken.FONT.SIZE_LG}px;
  font-weight: ${AntdToken.FONT_WEIGHT.MEDIUM};
  margin: 0 ${AntdToken.SPACING.XS}px 0 0;
`;

const Description = styled.p`
  font-size: ${AntdToken.FONT.SIZE}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  margin: ${AntdToken.SPACING.XXS}px 0 0;
`;

const GridArea = styled.div<{ hasPadding: boolean; hasGap?: boolean }>`
  padding: ${({ hasPadding }) => (hasPadding ? AntdToken.SPACING.LG : 0)}px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ hasGap }) => (hasGap ? AntdToken.SPACING.BASE : 0)}px;
`;
