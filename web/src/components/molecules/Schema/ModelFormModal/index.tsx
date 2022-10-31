import React, { useCallback, useEffect } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { Model } from "@reearth-cms/components/molecules/ProjectOverview";
import { useT } from "@reearth-cms/i18n";
import { validateKey } from "@reearth-cms/utils/regex";

export interface FormValues {
  modelId?: string;
  name: string;
  description: string;
  key: string;
}

export interface Props {
  model?: Model;
  projectId?: string;
  open?: boolean;
  isKeyAvailable: boolean;
  onClose: () => void;
  onCreate?: (values: FormValues) => Promise<void> | void;
  OnUpdate?: (values: FormValues) => Promise<void> | void;
  onModelKeyCheck: (projectId: string, key: string, ignoredKey?: string) => Promise<boolean>;
}

const ModelFormModal: React.FC<Props> = ({
  model,
  projectId,
  open,
  onClose,
  onCreate,
  OnUpdate,
  onModelKeyCheck,
}) => {
  const t = useT();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(model ?? {});
  }, [form, model]);

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    await onModelKeyCheck(projectId ?? "", values.key, model?.key);
    if (!model?.id) {
      await onCreate?.(values);
    } else {
      await OnUpdate?.({ modelId: model.id, ...values });
    }
    onClose();
    form.resetFields();
  }, [onModelKeyCheck, projectId, model, form, onClose, onCreate, OnUpdate]);

  const handleClose = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  return (
    <Modal
      visible={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      title={!model?.id ? t("New Model") : t("Update Model")}>
      <Form form={form} layout="vertical">
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
            { required: true, message: t("Please input the key of the model!") },
            {
              message: t("Key is not valid"),
              validator: async (_, value) => {
                if (!validateKey(value)) return Promise.reject();
                const isKeyAvailable = await onModelKeyCheck(projectId ?? "", value, model?.key);
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

export default ModelFormModal;
