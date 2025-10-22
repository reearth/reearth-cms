import styled from "@emotion/styled";

import Row from "@reearth-cms/components/atoms/Row";
import Spin from "@reearth-cms/components/atoms/Spin";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  spinnerSize?: "small" | "large" | "default";
  minHeight?: string;
};

const Loading: React.FC<Props> = ({ spinnerSize, minHeight }) => {
  const t = useT();

  return (
    <StyledRow justify="center" align="middle" minheight={minHeight}>
      <Spin tip={t("Loading")} size={spinnerSize} data-testid="loading" />
    </StyledRow>
  );
};

const StyledRow = styled(Row)<{ minheight?: string }>`
  ${({ minheight }) => (minheight ? `min-height: ${minheight}` : null)};
`;

export default Loading;
