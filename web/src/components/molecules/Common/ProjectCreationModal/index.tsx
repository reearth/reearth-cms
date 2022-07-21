import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import React, { useCallback } from "react";

export interface FormValues {
  name: string;
  description: string;
}

export interface Props {
  open?: boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
}

const initialValues: FormValues = {
  name: "",
  description: "",
};

const ProjectCreationModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async (values) => {
        await onSubmit?.(values);
        onClose?.(true);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }, [form, onClose, onSubmit]);

  const handleClose = useCallback(() => {
    onClose?.(true);
  }, [onClose]);
  return (
    <Modal visible={open} onCancel={handleClose} onOk={handleSubmit}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="name"
          label="Project name"
          rules={[
            { required: true, message: "Please input the name of project!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Project description">
          <TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectCreationModal;
