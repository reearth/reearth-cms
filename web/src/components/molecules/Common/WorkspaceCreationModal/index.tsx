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
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
  open: boolean;
};

const initialValues: FormValues = {
  name: "",
};

const WorkspaceCreationModal: React.FC<Props> = ({ onClose, onSubmit, open }) => {
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
      footer={[
        <Button disabled={loading} key="cancel" onClick={handleCancel}>
          {t("Cancel")}
        </Button>,
        <Button disabled={isDisabled} key="ok" loading={loading} onClick={handleOk} type="primary">
          {t("OK")}
        </Button>,
      ]}
      onCancel={handleCancel}
      open={open}>
      <Form
        form={form}
        initialValues={initialValues}
        layout="vertical"
        onValuesChange={handleValuesChange}>
        <Form.Item
          label={t("Workspace name")}
          name="name"
          rules={[
            {
              message: t("Please input the title of the new workspace!"),
              required: true,
            },
          ]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WorkspaceCreationModal;
