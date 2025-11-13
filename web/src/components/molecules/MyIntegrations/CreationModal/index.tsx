import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { IntegrationType } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onIntegrationCreate: (values: FormValues) => Promise<void>;
};

export type FormValues = {
  name: string;
  description: string;
  logoUrl: string;
  type: IntegrationType;
};

const initialValues: FormValues = {
  name: "",
  description: "",
  logoUrl: "",
  type: "Private",
};

const IntegrationCreationModal: React.FC<Props> = ({
  open,
  loading,
  onClose,
  onIntegrationCreate,
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
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      title={t("New Integration")}
      data-testid="myintegration-create-modal"
      footer={[
        <Button
          key="back"
          onClick={handleClose}
          disabled={loading}
          data-testid="myintegration-create-cancel-button">
          {t("Cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={isDisabled}
          loading={loading}
          data-testid="myintegration-create-ok-button">
          {t("Create")}
        </Button>,
      ]}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={handleValuesChange}>
        <Form.Item
          name="name"
          label={t("Integration Name")}
          rules={[
            {
              required: true,
              message: t("Please input the title of the integration!"),
            },
          ]}>
          <Input data-testid="myintegration-name-input" />
        </Form.Item>
        <Form.Item name="description" label={t("Description")}>
          <TextArea
            rows={3}
            showCount
            maxLength={100}
            data-testid="myintegration-description-input"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default IntegrationCreationModal;
