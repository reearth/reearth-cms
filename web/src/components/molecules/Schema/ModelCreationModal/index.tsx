import React, { useCallback, useState } from "react";

import Form, { FieldError } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";
import { validateKey } from "@reearth-cms/utils/regex";

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
  onModelKeyCheck: (projectId: string, key: string) => Promise<boolean>;
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
  onModelKeyCheck,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [buttonDisabled, setButtonDisabled] = useState(true);

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        await onModelKeyCheck(projectId ?? "", values.key);
        await onSubmit?.(values);
        onClose?.(true);
        form.resetFields();
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [onModelKeyCheck, projectId, form, onClose, onSubmit]);

  const handleClose = useCallback(() => {
    onClose?.(true);
  }, [onClose]);

  return (
    <Modal
      visible={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      okButtonProps={{ disabled: buttonDisabled }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={() => {
          form
            .validateFields()
            .then(() => {
              setButtonDisabled(false);
            })
            .catch(fieldsError => {
              setButtonDisabled(
                fieldsError.errorFields.some((item: FieldError) => item.errors.length > 0),
              );
            });
        }}>
        <Form.Item
          name="name"
          label={t("Model name")}
          rules={[{ required: true, message: t("Please input the name of the model!") }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={t("Model description")}>
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="key"
          label={t("Model key")}
          rules={[
            {
              message: t("Key is not valid"),
              required: true,
              validator: async (_, value) => {
                if (!validateKey(value)) return Promise.reject();
                const isKeyAvailable = await onModelKeyCheck(projectId ?? "", value);
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
