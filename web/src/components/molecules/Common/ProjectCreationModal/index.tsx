import { Form, Input, Modal } from "antd";
import TextArea from "antd/lib/input/TextArea";
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
      {/* {formik.isSubmitting} */}
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="name"
          label="Project name"
          rules={[
            { required: true, message: "Please input the title of workspace!" },
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
