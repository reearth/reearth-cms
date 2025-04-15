import styled from "@emotion/styled";
import { Typography } from "antd";
import type { CopyConfig } from "antd/lib/typography/Base";
import { RefAttributes } from "react";

import { useT } from "@reearth-cms/i18n";

const { Text } = Typography;

type Props = {
  copyable: CopyConfig;
} & RefAttributes<HTMLSpanElement>;

const CopyButton: React.FC<Props> = ({ copyable, ...props }) => {
  const t = useT();
  return <Text copyable={{ tooltips: [t("Copy"), t("Copied")], ...copyable }} {...props} />;
};

const StyledCopyButton = styled(CopyButton)<{ color?: string; hoverColor?: string; size?: number }>`
  display: inline-flex;
  .ant-typography-copy {
    transition: all 0.3s;
    color: ${({ color }) => color || "#00000073"};
    :focus {
      color: ${({ color }) => color || "#00000073"};
    }
    :active {
      color: ${({ hoverColor }) => hoverColor || "#000000e0"};
    }
    :hover {
      color: ${({ hoverColor }) => hoverColor || "#000000e0"};
    }
  }
  svg {
    ${({ size }) => `width: ${size}px; height: ${size}px;`};
  }
`;

export default StyledCopyButton;
