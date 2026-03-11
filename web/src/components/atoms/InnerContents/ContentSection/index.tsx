import styled from "@emotion/styled";
import { ReactNode } from "react";

import { AntdColor, CustomColor } from "@reearth-cms/utils/color";

type Props = {
  title?: string;
  danger?: boolean;
  headerActions?: ReactNode;
  children?: ReactNode;
  description?: string;
  hasPadding?: boolean;
};

const ContentSection: React.FC<Props> = ({
  title,
  headerActions,
  children,
  danger,
  description,
  hasPadding = true,
}) => {
  return (
    <Wrapper danger={danger}>
      {title && (
        <Header>
          <InnerHeader>
            <Title>{title}</Title>
            {headerActions}
          </InnerHeader>
          {description && <Description>{description}</Description>}
        </Header>
      )}
      <GridArea hasPadding={hasPadding}>{children}</GridArea>
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

const Header = styled.div`
  border-bottom: 1px solid ${CustomColor.BORDER_SUBTLE};
  padding: 10px 24px;
`;

const InnerHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.p`
  font-size: 16px;
  font-weight: 500;
  margin: 0 8px 0 0;
`;

const Description = styled.p`
  font-size: 14px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  margin: 4px 0 0;
`;

const GridArea = styled.div<{ hasPadding: boolean }>`
  ${({ hasPadding }) => hasPadding && "padding: 24px;"}
  flex: 1;
  display: flex;
  flex-direction: column;
`;
