import styled from "@emotion/styled";

import Row from "@reearth-cms/components/atoms/Row";
import Spin from "@reearth-cms/components/atoms/Spin";

export type Props = {
  spinnerSize?: "small" | "large" | "default";
  minHeight?: string;
};

const Loading: React.FC<Props> = ({ spinnerSize, minHeight }) => {
  return (
    <StyledRow justify="center" align="middle" minHeight={minHeight}>
      <Spin size={spinnerSize} data-testid="loading" />
    </StyledRow>
  );
};

const StyledRow = styled(Row, {
  shouldForwardProp: prop => prop !== "minHeight",
})<{ minHeight?: string }>`
  min-height: ${({ minHeight }) => minHeight};
`;

export default Loading;
