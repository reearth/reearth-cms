import React, { useCallback } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";

export interface FormValues {
  name: string;
  alias: string;
  description: string;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
};

const initialValues: FormValues = {
  name: "",
  alias: "",
  description: "",
};

const ProjectCreationModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const t = useT();
  const [form] = Form.useForm<FormValues>();

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        await onSubmit(values);
        onClose();
        form.resetFields();
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [form, onClose, onSubmit]);

  return (
    <Modal open={open} onCancel={onClose} onOk={handleSubmit}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="name"
          label={t("Project name")}
          rules={[{ required: true, message: t("Please input the name of project!") }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name={"alias"}
          label={t("Project alias")}
          rules={[{ required: true, message: t("Please input the alias of project!") }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={t("Project description")}>
          <TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectCreationModal;
