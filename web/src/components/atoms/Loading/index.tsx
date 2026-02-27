import styled from "@emotion/styled";

import Row from "@reearth-cms/components/atoms/Row";
import Spin from "@reearth-cms/components/atoms/Spin";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  minHeight?: string;
  spinnerSize?: "default" | "large" | "small";
};

const Loading: React.FC<Props> = ({ minHeight, spinnerSize }) => {
  const t = useT();

  return (
    <StyledRow align="middle" justify="center" minHeight={minHeight}>
      <Spin data-testid="loading" size={spinnerSize} tip={t("Loading")} />
    </StyledRow>
  );
};

const StyledRow = styled(Row)<{ minHeight?: string }>`
  min-height: ${({ minHeight }) => minHeight};
`;

export default Loading;
