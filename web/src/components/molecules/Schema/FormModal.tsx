import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { keyAutoFill, keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Group, ModelFormValues } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";
import { validateKey } from "@reearth-cms/utils/regex";

type Props = {
  data?: Group | Model;
  isModel: boolean;
  onClose: () => void;
  onCreate?: (values: ModelFormValues) => Promise<void>;
  onKeyCheck: (key: string, ignoredKey?: string) => Promise<boolean>;
  onUpdate?: (values: ModelFormValues) => Promise<void>;
  open: boolean;
};

type FormType = {
  description: string;
  key: string;
  name: string;
};

const FormModal: React.FC<Props> = ({
  data,
  isModel,
  onClose,
  onCreate,
  onKeyCheck,
  onUpdate,
  open,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormType>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const prevKey = useRef<{ isSuccess: boolean; key: string }>();

  const timeout = useRef<null | ReturnType<typeof setTimeout>>(null);
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
        prevKey.current = { isSuccess: true, key: value };
        return Promise.resolve();
      } else {
        prevKey.current = { isSuccess: false, key: value };
        return Promise.reject();
      }
    },
    [data?.key, onKeyCheck],
  );

  return (
    <Modal
      footer={[
        <Button disabled={isLoading} key="cancel" onClick={handleClose}>
          {t("Cancel")}
        </Button>,
        <Button
          disabled={isDisabled}
          key="ok"
          loading={isLoading}
          onClick={handleSubmit}
          type="primary">
          {t("OK")}
        </Button>,
      ]}
      onCancel={handleClose}
      open={open}
      title={title}>
      <Form form={form} layout="vertical" validateTrigger="">
        <Form.Item
          label={nameLabel}
          name="name"
          rules={[
            {
              message: nameMessage,
              required: true,
            },
          ]}>
          <Input onChange={handleNameChange} />
        </Form.Item>
        <Form.Item label={descriptionLabel} name="description">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          extra={keyExtra}
          label={keyLabel}
          name="key"
          rules={[
            {
              message: t("Key is not valid"),
              required: true,
              validator: async (_, value) => {
                await keyValidate(value);
              },
            },
          ]}>
          <Input maxLength={Constant.KEY.MAX_LENGTH} onChange={handleKeyChange} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;
