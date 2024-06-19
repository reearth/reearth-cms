import React, { useCallback, useState } from "react";

import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { keyAutoFill, keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
import { useT } from "@reearth-cms/i18n";
import { validateKey } from "@reearth-cms/utils/regex";

export interface FormValues {
  name: string;
  alias: string;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
  onProjectAliasCheck: (alias: string) => Promise<boolean>;
}

const initialValues: FormValues = {
  name: "",
  alias: "",
  description: "",
};

const ProjectCreationModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  onProjectAliasCheck,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

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

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setIsDisabled(true);
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      onClose();
      form.resetFields();
    } catch (_) {
      setIsDisabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [form, onClose, onSubmit]);

  const handleClose = useCallback(() => {
    onClose();
    form.resetFields();
    setIsDisabled(true);
  }, [form, onClose]);

  const handleValuesChange = useCallback(async () => {
    const hasError = await form
      .validateFields()
      .then(() => false)
      .catch((errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0);
    setIsDisabled(hasError);
  }, [form]);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      cancelButtonProps={{ disabled: isLoading }}
      okButtonProps={{ disabled: isDisabled }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={handleValuesChange}>
        <Form.Item
          name="name"
          label={t("Project name")}
          rules={[{ required: true, message: t("Please input the name of project!") }]}>
          <Input onChange={handleNameChange} />
        </Form.Item>
        <Form.Item
          name="alias"
          label={t("Project alias")}
          rules={[
            {
              message: t("Project alias is not valid"),
              required: true,
              validator: async (_, value) => {
                if (!validateKey(value) || value.length <= 4) {
                  return Promise.reject();
                }
                const isProjectAliasAvailable = await onProjectAliasCheck(value);
                return isProjectAliasAvailable ? Promise.resolve() : Promise.reject();
              },
            },
          ]}>
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
