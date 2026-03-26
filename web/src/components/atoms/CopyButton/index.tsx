import styled from "@emotion/styled";
import { Typography } from "antd";
import { forwardRef, ComponentProps } from "react";

import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";
import { AntdColor } from "@reearth-cms/utils/style";

const { Text } = Typography;

type CopyConfig = Exclude<ComponentProps<typeof Text>["copyable"], boolean | undefined>;

type Props = {
  copyable: CopyConfig;
};

const CopyButton = forwardRef<HTMLSpanElement, Props>(({ copyable, ...props }, ref) => {
  const t = useT();
  return (
    <Text ref={ref} copyable={{ tooltips: [t("Copy"), t("Copied")], ...copyable }} {...props} />
  );
});

const StyledCopyButton = styled(CopyButton, Constant.TRANSIENT_OPTIONS)<{
  $color?: string;
  $hoverColor?: string;
  $size?: number;
}>`
  display: inline-flex;
  .ant-typography-copy {
    transition: all 0.3s;
    color: ${({ $color }) => $color || AntdColor.NEUTRAL.TEXT_TERTIARY};
    :focus {
      color: ${({ $color }) => $color || AntdColor.NEUTRAL.TEXT_TERTIARY};
    }
    :active {
      color: ${({ $hoverColor }) => $hoverColor || AntdColor.NEUTRAL.TEXT_V5};
    }
    :hover {
      color: ${({ $hoverColor }) => $hoverColor || AntdColor.NEUTRAL.TEXT_V5};
    }
  }
  svg {
    ${({ $size }) => `width: ${$size}px; height: ${$size}px;`};
  }
`;

export default StyledCopyButton;
