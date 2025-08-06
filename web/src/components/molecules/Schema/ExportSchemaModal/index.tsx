import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Modal from "@reearth-cms/components/atoms/Modal";
import Steps from "@reearth-cms/components/atoms/Step";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import ExportingStep from "./ExportingStep";
import SelectFormatStep from "./SelectFormatStep";

type Props = {
  open: boolean;
  data?: Model | Group;
  exportLoading: boolean;
  onClose: () => void;
  onExport: (modelId?: string, format?: string) => Promise<void>;
  onGoToAssets?: () => void;
};

export type FormType = {
  format: string;
};

const ExportModal: React.FC<Props> = ({
  open,
  data,
  exportLoading,
  onClose,
  onExport,
  onGoToAssets,
}) => {
  const t = useT();
  const [currentPage, setCurrentPage] = useState(0);
  const [form] = Form.useForm<FormType>();
  const initialValues = useMemo(() => ({ format: "csv" }), []);

  const handleSubmit = useCallback(async () => {
    await onExport(data?.id, form.getFieldValue("format"));
    setCurrentPage(1);
  }, [data?.id, form, onExport]);

  const stepComponents = [
    {
      title: "Select format",
      content: <SelectFormatStep form={form} initialValues={initialValues} />,
    },
    {
      title: "Exporting",
      content: (
        <ExportingStep
          exportLoading={exportLoading}
          exportError={!data}
          onGoToAssets={onGoToAssets}
        />
      ),
    },
  ];

  const items = stepComponents.map(item => ({ key: item.title, title: item.title }));

  const footer = useMemo(() => {
    if (currentPage === 0) {
      return [
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={exportLoading}
          loading={exportLoading}>
          {t("Export")}
        </Button>,
      ];
    } else {
      return [];
    }
  }, [currentPage, exportLoading, handleSubmit, t]);

  return (
    <Modal title={t("Export")} open={open} onCancel={onClose} width={572} footer={footer}>
      <Container>
        <HiddenSteps current={currentPage} items={items} />
        <StepsContent>{stepComponents[currentPage].content}</StepsContent>
      </Container>
    </Modal>
  );
};

export default ExportModal;

const Container = styled.div`
  padding: 24px 0;
`;

const HiddenSteps = styled(Steps)`
  display: none;
`;

const StepsContent = styled.div`
  height: 100%;
`;
