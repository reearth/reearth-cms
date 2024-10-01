import React, { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

export interface FormValues {
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

const initialValues: FormValues = {
  name: "",
};

const WorkspaceCreationModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const t = useT();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const handleOk = useCallback(() => {
    setLoading(true);
    form
      .validateFields()
      .then(async values => {
        await onSubmit(values);
        onClose();
        form.resetFields();
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [form, onClose, onSubmit]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t("Cancel")}
        </Button>,
        <Button key="ok" type="primary" loading={loading} onClick={handleOk}>
          {t("OK")}
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

export default WorkspaceCreationModal;
