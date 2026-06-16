import styled from "@emotion/styled";
import { useMemo } from "react";

import Icon, { IconName } from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

type Props = {
  count: number;
};

const CountTag: React.FC<Props> = props => {
  const t = useT();
  const isEmpty = useMemo<boolean>(() => props.count === 0, [props.count]);

  const tag = useMemo<{ background: string; color: string; icon: IconName }>(
    () =>
      isEmpty
        ? {
            background: AntdColor.GOLD.GOLD_1,
            color: AntdColor.GOLD.GOLD_6,
            icon: "exclamationSolid",
          }
        : {
            background: AntdColor.GREEN.GREEN_1,
            color: AntdColor.GREEN.GREEN_6,
            icon: "checkCircle",
          },
    [isEmpty],
  );

  return (
    <StyledTag background={tag.background} color={tag.color}>
      <Icon icon={tag.icon} color={tag.color} size={14} />
      {t("{{count}} configured", { count: props.count })}
    </StyledTag>
  );
};

const StyledTag = styled.span<{ background: string; color: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XXS}px;
  align-self: flex-start;
  white-space: nowrap;
  border-radius: 100px;
  padding: 4px 8px;
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  background-color: ${({ background }) => background};
  color: ${({ color }) => color};
`;

export default CountTag;
