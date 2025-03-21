import styled from "@emotion/styled";

import Progress from "@reearth-cms/components/atoms/Progress";
import { useT } from "@reearth-cms/i18n";

type Props = {
  percent: number;
};

const ImportingStep: React.FC<Props> = ({ percent }) => {
  const t = useT();

  return (
    <Container>
      <Progress type="circle" percent={percent} />
      <StatusText>{t("Importing...")}</StatusText>
    </Container>
  );
};

export default ImportingStep;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StatusText = styled.p`
  font-size: 24px;
`;
