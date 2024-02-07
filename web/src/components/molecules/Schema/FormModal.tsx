import { useCallback, useState, useEffect } from "react";

import Form, { FieldError } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import {
  Model,
  ModelFormValues,
  Group,
  GroupFormValues,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { validateKey } from "@reearth-cms/utils/regex";

type Props = {
  data?: Model | Group;
  open?: boolean;
  onClose: () => void;
  onCreate?: (values: ModelFormValues | GroupFormValues) => Promise<void> | void;
  onUpdate?: (values: ModelFormValues | GroupFormValues) => Promise<void> | void;
  onKeyCheck: (key: string, ignoredKey?: string) => Promise<boolean>;
  isModel: boolean;
};

const FormModal: React.FC<Props> = ({
  data,
  open,
  onClose,
  onCreate,
  onUpdate,
  onKeyCheck,
  isModel,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [buttonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    if (open) {
      if (data) {
        form.setFieldsValue(data);
      } else {
        form.resetFields();
      }
    }
  }, [form, data, open]);

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    await onKeyCheck(values.key, data?.key);
    if (data?.id) {
      await onUpdate?.({ modelId: data.id, ...values });
    } else {
      await onCreate?.(values);
    }
    onClose();
    form.resetFields();
  }, [onKeyCheck, data, form, onClose, onCreate, onUpdate]);

  const handleClose = useCallback(() => {
    if (!data) {
      form.resetFields();
    }
    onClose();
  }, [form, data, onClose]);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      okButtonProps={{ disabled: buttonDisabled }}
      title={`${data?.id ? "Update" : "New"} ${isModel ? "Model" : "Group"}`}>
      <Form
        form={form}
        layout="vertical"
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
          label={t(`${isModel ? "Model" : "Group"} name`)}
          rules={[
            {
              required: true,
              message: t(`Please input the name of the ${isModel ? "model" : "group"}!`),
            },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={t(`${isModel ? "Model" : "Group"} description`)}>
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="key"
          label={t(`${isModel ? "Model" : "Group"} key`)}
          extra={t(
            `${
              isModel ? "Model" : "Group"
            } key must be unique and at least 1 character long. It can only contain letters, numbers, underscores and dashes.`,
          )}
          rules={[
            {
              message: t("Key is not valid"),
              required: true,
              validator: async (_, value) => {
                if (!validateKey(value)) return Promise.reject();
                const isKeyAvailable = await onKeyCheck(value, data?.key);
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

export default FormModal;
