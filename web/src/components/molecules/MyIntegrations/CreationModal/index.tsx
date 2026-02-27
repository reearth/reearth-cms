import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { IntegrationType } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  loading: boolean;
  onClose: () => void;
  onIntegrationCreate: (values: FormValues) => Promise<void>;
  open: boolean;
};

export type FormValues = {
  description: string;
  logoUrl: string;
  name: string;
  type: IntegrationType;
};

const initialValues: FormValues = {
  description: "",
  logoUrl: "",
  name: "",
  type: "Private",
};

const IntegrationCreationModal: React.FC<Props> = ({
  loading,
  onClose,
  onIntegrationCreate,
  open,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormValues>();
  const [isDisabled, setIsDisabled] = useState(true);

  const handleSubmit = useCallback(async () => {
    setIsDisabled(true);
    try {
      const values = await form.validateFields();
      values.logoUrl = "_"; // TODO: should be implemented when assets upload is ready to use
      values.type = "Private";
      await onIntegrationCreate(values);
      onClose();
      form.resetFields();
    } catch (_) {
      setIsDisabled(false);
    }
  }, [form, onClose, onIntegrationCreate]);

  const handleClose = useCallback(() => {
    form.resetFields();
    onClose();
    setIsDisabled(true);
  }, [onClose, form]);

  const handleValuesChange = useCallback(async () => {
    const hasError = await form
      .validateFields()
      .then(() => false)
      .catch((errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0);
    setIsDisabled(hasError);
  }, [form]);

  return (
    <Modal
      footer={[
        <Button disabled={loading} key="back" onClick={handleClose}>
          {t("Cancel")}
        </Button>,
        <Button
          disabled={isDisabled}
          key="submit"
          loading={loading}
          onClick={handleSubmit}
          type="primary">
          {t("Create")}
        </Button>,
      ]}
      onCancel={handleClose}
      onOk={handleSubmit}
      open={open}
      title={t("New Integration")}>
      <Form
        form={form}
        initialValues={initialValues}
        layout="vertical"
        onValuesChange={handleValuesChange}>
        <Form.Item
          label={t("Integration Name")}
          name="name"
          rules={[
            {
              message: t("Please input the title of the integration!"),
              required: true,
            },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item label={t("Description")} name="description">
          <TextArea maxLength={100} rows={3} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default IntegrationCreationModal;
