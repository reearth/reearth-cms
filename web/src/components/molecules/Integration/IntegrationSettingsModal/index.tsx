import React from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

export interface FormValues {
  name: string;
}

export interface Props {
  open?: boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: () => Promise<void> | void;
}

const IntegrationSettingsModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const t = useT();
  const { Option } = Select;
  const [form] = Form.useForm();

  return (
    <Modal
      title={t("Integration Setting")}
      visible={open}
      onCancel={() => onClose?.(true)}
      onOk={onSubmit}
      footer={[
        <Button key="back" onClick={() => onClose?.(true)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit}>
          Save
        </Button>,
      ]}>
      <Form form={form} layout="vertical" initialValues={{}}>
        <Form.Item
          name="role"
          label="Role"
          rules={[
            {
              required: true,
              message: t("Please input the appropriate role for this member!"),
            },
          ]}>
          <Select placeholder={t("select role")}>
            <Option value="READER">{t("Reader")}</Option>
            <Option value="WRITER">{t("Writer")}</Option>
            <Option value="OWNER">{t("Owner")}</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default IntegrationSettingsModal;
