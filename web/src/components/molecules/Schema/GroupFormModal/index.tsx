import { useCallback, useState, useEffect } from "react";

import Form, { FieldError } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { validateKey } from "@reearth-cms/utils/regex";

export interface FormValues {
  groupId?: string;
  name: string;
  description: string;
  key: string;
}

export interface Props {
  group?: Group;
  open?: boolean;
  isKeyAvailable: boolean;
  onClose: () => void;
  onCreate?: (values: FormValues) => Promise<void> | void;
  onUpdate?: (values: FormValues) => Promise<void> | void;
  onGroupKeyCheck: (key: string, ignoredKey?: string) => Promise<boolean>;
}

const GroupFormModal: React.FC<Props> = ({
  group,
  open,
  onClose,
  onCreate,
  onUpdate,
  onGroupKeyCheck,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [buttonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    if (!group) {
      form.resetFields();
    } else {
      form.setFieldsValue(group);
    }
  }, [form, group]);

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    await onGroupKeyCheck(values.key, group?.key);
    if (!group?.id) {
      await onCreate?.(values);
    } else {
      await onUpdate?.({ groupId: group.id, ...values });
    }
    onClose();
    form.resetFields();
  }, [onGroupKeyCheck, group, form, onClose, onCreate, onUpdate]);

  const handleClose = useCallback(() => {
    if (!group) {
      form.resetFields();
    }
    onClose();
  }, [form, group, onClose]);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      okButtonProps={{ disabled: buttonDisabled }}
      title={!group?.id ? t("New Group") : t("Update Group")}>
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
          label={t("Group name")}
          rules={[{ required: true, message: t("Please input the name of the group!") }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={t("Group description")}>
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="key"
          label={t("Group key")}
          extra={t(
            "Group key must be unique and at least 1 character long. It can only contain letters, numbers, underscores and dashes.",
          )}
          rules={[
            {
              message: t("Key is not valid"),
              required: true,
              validator: async (_, value) => {
                if (!validateKey(value)) return Promise.reject();
                const isKeyAvailable = await onGroupKeyCheck(value, group?.key);
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

export default GroupFormModal;
