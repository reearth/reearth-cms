import styled from "@emotion/styled";
import type { ReactNode } from "react";

import Card from "@reearth-cms/components/atoms/Card";
import { AntdToken } from "@reearth-cms/utils/style";

type Props = {
  title: string;
  children: ReactNode;
};

const SummaryCard: React.FC<Props> = ({ title, children }) => (
  <SummaryCol variant="borderless" styles={{ body: { padding: 0 } }}>
    <CardTitle>{title}</CardTitle>
    {children}
  </SummaryCol>
);

const SummaryCol = styled(Card)`
  flex: 1 1 0;
  min-width: 0;
`;

const CardTitle = styled.div`
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  font-weight: ${AntdToken.FONT_WEIGHT.STRONG};
`;

export default SummaryCard;
