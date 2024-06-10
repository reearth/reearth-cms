import { useCallback, useState, useEffect, useMemo } from "react";

import Form, { FieldError } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { keyAutoFill, keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { ModelFormValues, Group } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { validateKey } from "@reearth-cms/utils/regex";

interface Props {
  data?: Model | Group;
  open: boolean;
  onClose: () => void;
  onCreate?: (values: ModelFormValues) => Promise<void>;
  onUpdate?: (values: ModelFormValues) => Promise<void>;
  onKeyCheck: (key: string, ignoredKey?: string) => Promise<boolean>;
  isModel: boolean;
}

interface FormType {
  name: string;
  description: string;
  key: string;
}

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
  const [form] = Form.useForm<FormType>();
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

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (data) return;
      keyAutoFill(e, { form, key: "key" });
    },
    [data, form],
  );

  const handleKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      keyReplace(e, { form, key: "key" });
    },
    [form],
  );

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    await onKeyCheck(values.key, data?.key);
    if (data?.id) {
      await onUpdate?.({ id: data.id, ...values });
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

  const title = useMemo(
    () =>
      isModel
        ? data?.id
          ? t("Update Model")
          : t("New Model")
        : data?.id
          ? t("Update Group")
          : t("New Group"),
    [data?.id, isModel, t],
  );

  const nameLabel = useMemo(() => (isModel ? t("Model name") : t("Group name")), [isModel, t]);
  const nameMessage = useMemo(
    () =>
      isModel ? t("Please input the name of the model!") : t("Please input the name of the group!"),
    [isModel, t],
  );
  const descriptionLabel = useMemo(
    () => (isModel ? t("Model description") : t("Group description")),
    [isModel, t],
  );
  const keyLabel = useMemo(() => (isModel ? t("Model key") : t("Group key")), [isModel, t]);
  const keyExtra = useMemo(
    () =>
      isModel
        ? t(
            "Model key must be unique and at least 1 character long. It can only contain letters, numbers, underscores and dashes.",
          )
        : t(
            "Group key must be unique and at least 1 character long. It can only contain letters, numbers, underscores and dashes.",
          ),
    [isModel, t],
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      okButtonProps={{ disabled: buttonDisabled }}
      title={title}>
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
          label={nameLabel}
          rules={[
            {
              required: true,
              message: nameMessage,
            },
          ]}>
          <Input onChange={handleNameChange} />
        </Form.Item>
        <Form.Item name="description" label={descriptionLabel}>
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="key"
          label={keyLabel}
          extra={keyExtra}
          rules={[
            ({ getFieldValue }) => ({
              async validator() {
                const value = getFieldValue("key");
                if (value && validateKey(value)) {
                  const isKeyAvailable = await onKeyCheck(value, data?.key);
                  if (isKeyAvailable) {
                    return Promise.resolve();
                  }
                }
                return Promise.reject(new Error(t("Key is not valid")));
              },
            }),
          ]}>
          <Input onChange={handleKeyChange} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;
