import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Col from "@reearth-cms/components/atoms/Col";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Row from "@reearth-cms/components/atoms/Row";
import { useT } from "@reearth-cms/i18n";

// TODO: will be changed when when hooks are added
const options = [
  { label: "Create", value: "Create" },
  { label: "Update", value: "Update" },
  { label: "Delete", value: "Delete" },
  { label: "Accessed by API", value: "Accessed by API" },
];

const WebhookForm: React.FC = () => {
  const t = useT();
  const [form] = Form.useForm();

  return (
    <>
      <Icon icon="arrowLeft" onClick={() => {}} />
      <StyledForm form={form} layout="vertical" initialValues={{}}>
        <Row gutter={32}>
          <Col span={11}>
            <Form.Item
              name="name"
              label={t("Name")}
              extra={t("This is your webhook name")}
              rules={[
                {
                  required: true,
                  message: t("Please input the name of the webhook!"),
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="url"
              label={t("Url")}
              extra={t("Please note that all webhook URLs must start with http://.")}
              rules={[
                {
                  required: true,
                  message: t("Please input the name of the webhook!"),
                },
                {
                  message: "URL is not valid",
                  validator: async (_, value) => {
                    if (
                      !/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
                        value,
                      ) &&
                      value.length > 0
                    )
                      return Promise.reject();

                    return Promise.resolve();
                  },
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {t("Save")}
              </Button>
            </Form.Item>
          </Col>
          <Col>
            <Divider type="vertical" style={{ height: "100%" }} />
          </Col>
          <Col span={11}>
            <CheckboxTitle>{t("Trigger Event")}</CheckboxTitle>
            <Form.Item label={t("Item")}>
              <Checkbox.Group options={options} onChange={() => {}} />
            </Form.Item>
            <Form.Item label={t("Asset")}>
              <Checkbox.Group options={options} onChange={() => {}} />
            </Form.Item>
          </Col>
        </Row>
      </StyledForm>
    </>
  );
};

const StyledForm = styled(Form)`
  margin-top: 36px;
`;

const CheckboxTitle = styled.h5`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000000d9;
  margin-bottom: 24px;
`;

export default WebhookForm;
