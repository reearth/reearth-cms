import styled from "@emotion/styled";
import type { ComponentProps, ReactNode } from "react";

import Flex from "@reearth-cms/components/atoms/Flex";
import Typography from "@reearth-cms/components/atoms/Typography";
import { AntdToken } from "@reearth-cms/utils/style";

type Props = {
  value: number;
  label: ReactNode;
  type?: ComponentProps<typeof Typography.Text>["type"];
};

const Stat: React.FC<Props> = ({ value, label, type }) => (
  <Flex vertical>
    <StatValue type={type}>{value}</StatValue>
    <StatLabel type="secondary">{label}</StatLabel>
  </Flex>
);

const StatValue = styled(Typography.Text)`
  font-size: ${AntdToken.FONT.SIZE_XL}px;
  font-weight: ${AntdToken.FONT_WEIGHT.STRONG};
`;

const StatLabel = styled(Typography.Text)`
  display: inline-flex;
  gap: ${AntdToken.SPACING.XXS}px;
  font-size: ${AntdToken.FONT.SIZE_SM}px;
`;

export default Stat;
