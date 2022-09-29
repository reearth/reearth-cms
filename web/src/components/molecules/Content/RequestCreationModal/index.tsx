import { useCallback } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";

export interface FormValues {
  title: string;
  description: string;
}

export interface Props {
  open?: boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
}

const initialValues: FormValues = {
  title: "",
  description: "",
};

const RequestCreationModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const t = useT();
  const [form] = Form.useForm();
  const { Option } = Select;

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        await onSubmit?.(values);
        onClose?.(true);
        form.resetFields();
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [form, onClose, onSubmit]);

  const handleClose = useCallback(() => {
    onClose?.(true);
  }, [onClose]);
  return (
    <Modal visible={open} onCancel={handleClose} onOk={handleSubmit} title={t("New Request")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="title"
          label={t("Title")}
          rules={[{ required: true, message: t("Please input the title of request!") }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={t("Description")}>
          <TextArea rows={4} showCount maxLength={100} />
        </Form.Item>
        <Form.Item
          name="role"
          label="Role"
          rules={[
            {
              required: true,
              message: t("Please select the reviewer!"),
            },
          ]}>
          <Select placeholder={t("Reviewer")}>
            <Option value="OWNER">{t("Owner")}</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RequestCreationModal;
