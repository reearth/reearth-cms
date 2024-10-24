import { useCallback, useEffect, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { IntegrationMember, Role } from "@reearth-cms/components/molecules/Integration/types";
import { useT } from "@reearth-cms/i18n";

type FormValues = {
  role: Role;
};

type Props = {
  selectedIntegrationMember?: IntegrationMember;
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (role: Role) => Promise<void>;
};

const IntegrationSettingsModal: React.FC<Props> = ({
  selectedIntegrationMember,
  open,
  loading,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const { Option } = Select;
  const [form] = Form.useForm<FormValues>();
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    form.setFieldsValue({
      role: selectedIntegrationMember?.integrationRole,
    });
  }, [form, selectedIntegrationMember]);

  const handleSubmit = useCallback(async () => {
    setIsDisabled(true);
    try {
      const values = await form.validateFields();
      await onSubmit(values.role);
      onClose();
      form.resetFields();
    } catch (_) {
      setIsDisabled(false);
    }
  }, [form, onClose, onSubmit]);

  const handleSelect = useCallback(
    (value: string) => {
      setIsDisabled(value === selectedIntegrationMember?.integrationRole);
    },
    [selectedIntegrationMember?.integrationRole],
  );

  const handleAfterClose = useCallback(() => {
    form.setFieldsValue({
      role: selectedIntegrationMember?.integrationRole,
    });
    setIsDisabled(true);
  }, [form, selectedIntegrationMember?.integrationRole]);

  return (
    <Modal
      afterClose={handleAfterClose}
      title={t("Integration Setting") + "  " + selectedIntegrationMember?.integration?.name}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>
          {t("Cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={isDisabled}
          loading={loading}>
          {t("Save")}
        </Button>,
      ]}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ role: selectedIntegrationMember?.integrationRole }}>
        <Form.Item
          name="role"
          label={t("Role")}
          rules={[
            {
              required: true,
              message: t("Please input the appropriate role for this integration!"),
            },
          ]}>
          <Select placeholder={t("select role")} onSelect={handleSelect}>
            <Option value="READER">{t("Reader")}</Option>
            <Option value="WRITER">{t("Writer")}</Option>
            <Option value="MAINTAINER">{t("Maintainer")}</Option>
            <Option value="OWNER">{t("Owner")}</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default IntegrationSettingsModal;
