import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

export type FormValues = {
  name: string;
};

export type Props = {
  open?: boolean;
  onClose?: () => void;
  onSubmit?: () => Promise<void> | void;
};

const IntegrationSettingsModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const t = useT();
  const { Option } = Select;
  const [form] = Form.useForm();

  return (
    <Modal
      title={t("Integration Setting")}
      visible={open}
      onCancel={() => onClose?.()}
      onOk={onSubmit}
      footer={[
        <Button key="back" onClick={() => onClose?.()}>
          {t("Cancel")}
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit}>
          {t("Save")}
        </Button>,
      ]}>
      <Form form={form} layout="vertical" initialValues={{}}>
        <Form.Item
          name="role"
          label="Role"
          rules={[
            {
              required: true,
              message: t("Please input the appropriate role for this integration!"),
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
