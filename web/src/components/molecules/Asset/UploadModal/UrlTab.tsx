import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

type Props = {
  isCompressedFile: boolean;
};

const UrlTab: React.FC<Props> = ({ isCompressedFile }) => {
  const t = useT();

  return (
    <>
      <Form.Item
        name="url"
        label={t("URL")}
        rules={[{ type: "url", warningOnly: true, message: t("Please input a valid URL") }]}>
        <Input placeholder={t("Please input the URL of the asset!")} />
      </Form.Item>
      {isCompressedFile && (
        <Form.Item name="autoUnzip" valuePropName="checked">
          <Checkbox>{t("Auto Unzip")}</Checkbox>
        </Form.Item>
      )}
    </>
  );
};

export default UrlTab;
