import styled from "@emotion/styled";
import { useEffect, useMemo, useState } from "react";

import Progress from "@reearth-cms/components/atoms/Progress";
import { useT } from "@reearth-cms/i18n";

type Props = {
  fieldsCreationLoading: boolean;
  fieldsCreationError?: boolean;
  onModalClose: () => void;
};

const AUTO_CLOSE_DELAY = 1000; // milliseconds

const ImportingStep: React.FC<Props> = ({
  fieldsCreationLoading,
  fieldsCreationError,
  onModalClose,
}) => {
  const t = useT();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(fieldsCreationLoading || fieldsCreationError ? 0 : 100); // TODO: implement a better mechanism
  }, [fieldsCreationLoading, fieldsCreationError]);

  const statusMessage = useMemo(() => {
    if (fieldsCreationError) {
      return t("Import not successful.");
    }
    if (fieldsCreationLoading) {
      return t("Importing...");
    }
    return t("Import successful!");
  }, [fieldsCreationError, fieldsCreationLoading, t]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (!fieldsCreationLoading) {
      timeout = setTimeout(() => {
        onModalClose();
      }, AUTO_CLOSE_DELAY);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [fieldsCreationLoading, onModalClose]);

  return (
    <Container>
      <Progress type="circle" percent={progress} />
      <StatusText>{statusMessage}</StatusText>
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
