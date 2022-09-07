import React, { useCallback } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";

export interface FormValues {
  name: string;
  description: string;
  key: string;
}

export interface Props {
  projectId?: string;
  open?: boolean;
  isKeyAvailable: boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
  handleModelKeyCheck: (projectId: string, key: string) => Promise<boolean>;
}

const initialValues: FormValues = {
  name: "",
  description: "",
  key: "",
};

const ModelCreationModal: React.FC<Props> = ({
  projectId,
  open,
  onClose,
  onSubmit,
  handleModelKeyCheck,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        await handleModelKeyCheck(projectId ?? "", values.key);
        await onSubmit?.(values);
        onClose?.(true);
        form.resetFields();
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [handleModelKeyCheck, projectId, form, onClose, onSubmit]);

  const handleClose = useCallback(() => {
    onClose?.(true);
  }, [onClose]);

  return (
    <Modal visible={open} onCancel={handleClose} onOk={handleSubmit}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="name"
          label="Model name"
          rules={[{ required: true, message: "Please input the name of the model!" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Model description">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="key"
          label="Model key"
          rules={[
            { required: true, message: "Please input the key of the model!" },
            {
              message: "Key is not valid",
              validator: async (_, value) => {
                if (!/^[a-zA-Z0-9]+$/.test(value) || value.length < 5) return Promise.reject();
                const isKeyAvailable = await handleModelKeyCheck(projectId ?? "", value);
                if (isKeyAvailable) {
                  return Promise.resolve();
                } else {
                  return Promise.reject();
                }
              },
            },
          ]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModelCreationModal;
