import React, { useCallback, useState, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { keyAutoFill, keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
import { useT } from "@reearth-cms/i18n";
import { MAX_KEY_LENGTH, validateKey } from "@reearth-cms/utils/regex";

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

  const values = Form.useWatch([], form);
  useEffect(() => {
    if (form.getFieldValue("name") && form.getFieldValue("alias")) {
      form
        .validateFields()
        .then(() => setIsDisabled(false))
        .catch(() => setIsDisabled(true));
    } else {
      setIsDisabled(true);
    }
  }, [form, values]);

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

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={isLoading}>
          {t("Cancel")}
        </Button>,
        <Button
          key="ok"
          type="primary"
          loading={isLoading}
          onClick={handleSubmit}
          disabled={isDisabled}>
          {t("OK")}
        </Button>,
      ]}>
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
          extra={t(
            "Project alias must be unique and at least 5 characters long. It can only contain letters, numbers, underscores, and dashes.",
          )}
          rules={[
            {
              message: t("Project alias is not valid"),
              required: true,
              validator: async (_, value) => {
                if (value.length >= 5 && validateKey(value) && (await onProjectAliasCheck(value))) {
                  return Promise.resolve();
                }
                return Promise.reject();
              },
            },
          ]}>
          <Input onChange={handleAliasChange} showCount maxLength={MAX_KEY_LENGTH} />
        </Form.Item>
        <Form.Item name="description" label={t("Project description")}>
          <TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectCreationModal;
