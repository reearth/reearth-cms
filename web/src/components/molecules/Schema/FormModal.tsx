import { useCallback, useState, useEffect, useMemo, useRef } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { keyAutoFill, keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { ModelFormValues, Group } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { MAX_KEY_LENGTH, validateKey } from "@reearth-cms/utils/regex";

type Props = {
  data?: Model | Group;
  open: boolean;
  onClose: () => void;
  onCreate?: (values: ModelFormValues) => Promise<void>;
  onUpdate?: (values: ModelFormValues) => Promise<void>;
  onKeyCheck: (key: string, ignoredKey?: string) => Promise<boolean>;
  isModel: boolean;
};

type FormType = {
  name: string;
  description: string;
  key: string;
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
  const [form] = Form.useForm<FormType>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const prevKey = useRef<{ key: string; isSuccess: boolean }>();

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const values = Form.useWatch<FormType | undefined>([], form);
  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
    if (
      data?.name === values?.name &&
      data?.description === values?.description &&
      data?.key === values?.key
    ) {
      setIsDisabled(true);
      return;
    }
    const validate = () => {
      form
        .validateFields()
        .then(() => setIsDisabled(false))
        .catch(() => setIsDisabled(true));
    };
    timeout.current = setTimeout(validate, 300);
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [data, form, values]);

  useEffect(() => {
    if (open) {
      setIsDisabled(true);
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
    setIsDisabled(true);
    setIsLoading(true);
    try {
      const values = await form.validateFields();
      await onKeyCheck(values.key, data?.key);
      if (data?.id) {
        await onUpdate?.({ id: data.id, ...values });
      } else {
        await onCreate?.(values);
      }
      onClose();
      form.resetFields();
    } catch (_) {
      setIsDisabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [onKeyCheck, data, form, onClose, onCreate, onUpdate]);

  const handleClose = useCallback(() => {
    if (!data) {
      form.resetFields();
    }
    onClose();
    setIsDisabled(true);
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
            "Model key must be unique and at least 3 characters long. It can only contain letters, numbers, underscores, and dashes.",
          )
        : t(
            "Group key must be unique and at least 3 characters long. It can only contain letters, numbers, underscores, and dashes.",
          ),
    [isModel, t],
  );

  const keyValidate = useCallback(
    async (value: string) => {
      if (prevKey.current?.key === value) {
        return prevKey.current?.isSuccess ? Promise.resolve() : Promise.reject();
      } else if (value.length >= 3 && validateKey(value) && (await onKeyCheck(value, data?.key))) {
        prevKey.current = { key: value, isSuccess: true };
        return Promise.resolve();
      } else {
        prevKey.current = { key: value, isSuccess: false };
        return Promise.reject();
      }
    },
    [data?.key, onKeyCheck],
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={title}
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
      <Form form={form} layout="vertical" validateTrigger="">
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
            {
              message: t("Key is not valid"),
              required: true,
              validator: async (_, value) => {
                await keyValidate(value);
              },
            },
          ]}>
          <Input onChange={handleKeyChange} showCount maxLength={MAX_KEY_LENGTH} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;
