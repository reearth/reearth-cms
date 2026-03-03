import { useCallback, useEffect, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import { CurrentView } from "@reearth-cms/components/molecules/View/types";
import { modalStateType } from "@reearth-cms/components/organisms/Project/Content/ViewsMenu/hooks";
import { useT } from "@reearth-cms/i18n";

type Props = {
  currentView: CurrentView;
  modalState: modalStateType;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  OnUpdate: (viewId: string, name: string) => Promise<void>;
  open: boolean;
  submitting: boolean;
};

type FormType = {
  name: string;
};

const ViewFormModal: React.FC<Props> = ({
  currentView,
  modalState,
  onClose,
  onCreate,
  OnUpdate,
  open,
  submitting,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormType>();
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (open) {
      if (currentView && modalState === "rename") {
        form.setFieldsValue(currentView);
      } else {
        form.resetFields();
      }
    }
  }, [form, currentView, open, modalState]);

  const handleSubmit = useCallback(async () => {
    setIsDisabled(true);
    try {
      const values = await form.validateFields();
      if (modalState === "create") {
        await onCreate(values.name);
      } else if (currentView.id) {
        await OnUpdate(currentView.id, values.name);
      }
      onClose();
      form.resetFields();
    } catch {
      setIsDisabled(false);
    }
  }, [form, modalState, onClose, onCreate, OnUpdate, currentView.id]);

  const handleClose = useCallback(() => {
    form.resetFields();
    setIsDisabled(true);
    onClose();
  }, [form, onClose]);

  const handleValuesChange = useCallback(
    async (_: unknown, values: FormType) => {
      if (currentView.name === values.name) {
        setIsDisabled(true);
        return;
      }
      const hasError = await form
        .validateFields()
        .then(() => false)
        .catch((errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0);
      setIsDisabled(hasError);
    },
    [currentView.name, form],
  );

  return (
    <Modal
      footer={[
        <Button disabled={submitting} key="back" onClick={handleClose}>
          {t("Cancel")}
        </Button>,
        <Button
          disabled={isDisabled}
          key="submit"
          loading={submitting}
          onClick={handleSubmit}
          type="primary">
          {t("OK")}
        </Button>,
      ]}
      onCancel={handleClose}
      open={open}
      title={modalState === "create" ? t("New View") : t("Update View")}>
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Form.Item
          extra={t("This is the title of the view")}
          label={t("View Name")}
          name="name"
          rules={[{ message: t("Please input the view name!"), required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ViewFormModal;
