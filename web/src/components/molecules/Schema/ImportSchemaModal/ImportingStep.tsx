import styled from "@emotion/styled";

import Progress from "@reearth-cms/components/atoms/Progress";

type ImportingStepProps = {
  t: (key: string) => string;
};

const ImportingStep: React.FC<ImportingStepProps> = ({ t }) => (
  <Container>
    <Progress type="circle" percent={50} />
    <StatusText>{t("Importing...")}</StatusText>
  </Container>
);

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
