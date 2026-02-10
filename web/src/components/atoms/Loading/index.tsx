import styled from "@emotion/styled";

import Row from "@reearth-cms/components/atoms/Row";
import Spin from "@reearth-cms/components/atoms/Spin";
import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";

export type Props = {
  spinnerSize?: "small" | "large" | "default";
  minHeight?: string;
};

const Loading: React.FC<Props> = ({ spinnerSize, minHeight }) => {
  const t = useT();

  return (
    <StyledRow justify="center" align="middle" $minHeight={minHeight}>
      <Spin tip={t("Loading")} size={spinnerSize} data-testid="loading" />
    </StyledRow>
  );
};

const StyledRow = styled(Row, Constant.TRANSIENT_OPTIONS)<{ $minHeight?: string }>`
  min-height: ${({ $minHeight }) => $minHeight};
`;

export default Loading;
