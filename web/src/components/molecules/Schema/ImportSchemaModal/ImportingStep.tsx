import styled from "@emotion/styled";

import Progress from "@reearth-cms/components/atoms/Progress";
import { useT } from "@reearth-cms/i18n";

type Props = {
  progress: number;
};

const ImportingStep: React.FC<Props> = ({ progress }) => {
  const t = useT();

  return (
    <Container>
      <Progress type="circle" percent={progress} />
      <StatusText>{progress < 100 ? t("Importing...") : t("Import successful!")}</StatusText>
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
