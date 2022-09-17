import React, { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

export interface FormValues {
  name: string;
}

export interface Props {
  open?: boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
}

const initialValues: FormValues = {
  name: "",
};

const IntegrationCreationModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const t = useT();
  const [form] = Form.useForm();

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        await onSubmit?.(values);
        onClose?.(true);
        form.resetFields();
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [form, onClose, onSubmit]);

  return (
    <Modal
      visible={open}
      onCancel={() => onClose?.(true)}
      onOk={handleSubmit}
      title={t("New Integration")}
      footer={[
        <Button key="back" onClick={() => onClose?.()}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Save
        </Button>,
      ]}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="name"
          label={t("Workspace name")}
          rules={[
            {
              required: true,
              message: t("Please input the title of the current workspace!"),
            },
          ]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default IntegrationCreationModal;
