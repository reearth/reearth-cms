import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { useT } from "@reearth-cms/i18n";
import { AntdColor } from "@reearth-cms/utils/style";

type Props = {
  disabled?: boolean;
};

const ExperimentIcon: React.FC<Props> = ({ disabled = false }) => {
  const t = useT();

  return (
    <Tooltip
      title={
        disabled
          ? undefined
          : t("This function is currently experimental and remains somewhat unstable")
      }>
      <IconWrapper disabled={disabled}>
        <Icon icon="experimentOutlined" color={AntdColor.GOLD.GOLD_5} />
      </IconWrapper>
    </Tooltip>
  );
};

export default ExperimentIcon;

const IconWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  align-items: center;

  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;
