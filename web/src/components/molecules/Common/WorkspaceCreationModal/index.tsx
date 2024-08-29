import React, { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

export type FormValues = {
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
};

const initialValues: FormValues = {
  name: "",
};

const WorkspaceCreationModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const t = useT();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  const handleValuesChange = useCallback(async () => {
    const hasError = await form
      .validateFields()
      .then(() => false)
      .catch((errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0);
    setIsDisabled(hasError);
  }, [form]);

  const handleOk = useCallback(async () => {
    setLoading(true);
    setIsDisabled(true);
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      onClose();
      form.resetFields();
    } catch (_) {
      setIsDisabled(false);
    } finally {
      setLoading(false);
    }
  }, [form, onClose, onSubmit]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          {t("Cancel")}
        </Button>,
        <Button key="ok" type="primary" loading={loading} onClick={handleOk} disabled={isDisabled}>
          {t("OK")}
        </Button>,
      ]}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={handleValuesChange}>
        <Form.Item
          name="name"
          label={t("Workspace name")}
          rules={[
            {
              required: true,
              message: t("Please input the title of the new workspace!"),
            },
          ]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WorkspaceCreationModal;
