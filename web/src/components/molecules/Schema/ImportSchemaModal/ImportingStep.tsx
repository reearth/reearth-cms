import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import Progress from "@reearth-cms/components/atoms/Progress";
import { useT } from "@reearth-cms/i18n";

type Props = {
  fieldsCreationLoading: boolean;
};

const ImportingStep: React.FC<Props> = ({ fieldsCreationLoading }) => {
  const t = useT();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // TODO: Implement a more sophisticated progress tracking mechanism
    if (fieldsCreationLoading) {
      setProgress(0);
    } else {
      setProgress(100);
    }
  }, [fieldsCreationLoading]);

  return (
    <Container>
      <Progress type="circle" percent={progress} />
      <StatusText>{fieldsCreationLoading ? t("Importing...") : t("Import successful!")}</StatusText>
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
