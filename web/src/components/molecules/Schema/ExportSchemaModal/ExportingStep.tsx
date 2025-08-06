import styled from "@emotion/styled";
import { useEffect, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Progress from "@reearth-cms/components/atoms/Progress";
import { useT } from "@reearth-cms/i18n";

type Props = {
  exportLoading: boolean;
  exportError?: boolean;
  onGoToAssets?: () => void;
};

const ExportingStep: React.FC<Props> = ({ exportLoading, exportError, onGoToAssets }) => {
  const t = useT();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(exportLoading || exportError ? 0 : 100); // TODO: implement a better mechanism
  }, [exportLoading, exportError]);

  const statusMessage = useMemo(() => {
    if (exportError) {
      return t("Export not successful.");
    }
    if (exportLoading) {
      return t("Generating...");
    }
    return t("Export successful!");
  }, [exportError, exportLoading, t]);

  return (
    <Container>
      <Progress type="circle" percent={progress} />
      <StatusText>{statusMessage}</StatusText>
      {!exportError && !exportLoading && (
        <Button onClick={onGoToAssets} type="primary">
          {t("Go to Assets")}
        </Button>
      )}
    </Container>
  );
};

export default ExportingStep;

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
