import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import Upload from "@reearth-cms/components/atoms/Upload";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  open?: boolean;
  onClose?: () => void;
  onSubmit?: () => Promise<void> | void;
}

const IntegrationCreationModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const t = useT();
  const [form] = Form.useForm();

  return (
    <Modal
      visible={open}
      onCancel={() => onClose?.()}
      onOk={onSubmit}
      title={t("New Integration")}
      footer={[
        <Button key="back" onClick={() => onClose?.()}>
          {t("Cancel")}
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit}>
          {t("Create")}
        </Button>,
      ]}>
      <Form form={form} layout="vertical" initialValues={{}}>
        <Form.Item label={t("Logo Image")}>
          <Upload maxCount={1} listType="picture-card">
            <Icon icon="plus" />
          </Upload>
        </Form.Item>
        <Form.Item
          name="name"
          label={t("Integration Name")}
          rules={[
            {
              required: true,
              message: t("Please input the title of the integration!"),
            },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={t("Description")}>
          <TextArea rows={3} showCount maxLength={100} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default IntegrationCreationModal;
