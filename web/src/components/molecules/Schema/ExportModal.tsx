import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  open: boolean;
  data?: Model | Group;
  exportLoading: boolean;
  onClose: () => void;
  onExport: (modelId?: string, format?: string) => Promise<void>;
};

type FormType = {
  format: string;
};

const ExportModal: React.FC<Props> = ({ open, data, exportLoading, onClose, onExport }) => {
  const t = useT();
  const [form] = Form.useForm<FormType>();
  const [isDisabled, setIsDisabled] = useState(true);
  const initialValues = useMemo(() => ({ format: "csv" }), []);
  const formats = useMemo(
    () => [
      { key: "csv", label: t("CSV") },
      { key: "json", label: t("JSON") },
      { key: "geojson", label: t("GeoJSON") },
    ],
    [t],
  );

  const handleSelect = (value: string) => {
    setIsDisabled(value === initialValues.format);
  };

  const handleSubmit = useCallback(async () => {
    setIsDisabled(true);
    try {
      const values = await form.validateFields();
      await onExport(data?.id, values.format);
    } catch (_) {
      setIsDisabled(false);
    }
  }, [data?.id, form, onExport]);

  return (
    <Modal
      title={t("Export")}
      open={open}
      onCancel={onClose}
      width={572}
      footer={[
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={isDisabled || exportLoading}
          loading={exportLoading}>
          {t("Export")}
        </Button>,
      ]}>
      <Container>
        <Form form={form} initialValues={initialValues} layout="vertical" autoComplete="off">
          <Form.Item
            name="format"
            label={t("File type")}
            extra={t(
              "If a Geometry field is included, it is recommended to export as GeoJSON format.",
            )}>
            <Select onSelect={handleSelect}>
              {formats?.map(format => (
                <Select.Option key={format.key} value={format.key}>
                  {format.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Container>
    </Modal>
  );
};

export default ExportModal;

const Container = styled.div`
  padding: 24px 0;
`;
