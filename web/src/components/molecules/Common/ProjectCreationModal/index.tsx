import React, { useCallback } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { keyAutoFill, keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
import { useT } from "@reearth-cms/i18n";

export interface FormValues {
  name: string;
  alias: string;
  description: string;
}

export type Props = {
  open?: boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
};

const initialValues: FormValues = {
  name: "",
  alias: "",
  description: "",
};

const ProjectCreationModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const t = useT();
  const [form] = Form.useForm();

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      keyAutoFill(e, { form, key: "alias" });
    },
    [form],
  );

  const handleAliasChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      keyReplace(e, { form, key: "alias" });
    },
    [form],
  );

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

  const handleClose = useCallback(() => {
    onClose?.(true);
  }, [onClose]);
  return (
    <Modal open={open} onCancel={handleClose} onOk={handleSubmit}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="name"
          label={t("Project name")}
          rules={[{ required: true, message: t("Please input the name of project!") }]}>
          <Input onChange={handleNameChange} />
        </Form.Item>
        <Form.Item
          name="alias"
          label={t("Project alias")}
          rules={[{ required: true, message: t("Please input the alias of project!") }]}>
          <Input onChange={handleAliasChange} />
        </Form.Item>
        <Form.Item name="description" label={t("Project description")}>
          <TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectCreationModal;
