import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Col from "@reearth-cms/components/atoms/Col";
import CopyButton from "@reearth-cms/components/atoms/CopyButton";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Password from "@reearth-cms/components/atoms/Password";
import Row from "@reearth-cms/components/atoms/Row";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import {
  Integration,
  IntegrationInfo,
} from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  integration: IntegrationInfo & Pick<Integration, "config">;
  updateIntegrationLoading: boolean;
  regenerateLoading: boolean;
  onIntegrationUpdate: (data: IntegrationInfo) => Promise<void>;
  onRegenerateToken: () => Promise<void>;
};

type FormType = {
  name: string;
  description: string;
  logoUrl: string;
};

const MyIntegrationForm: React.FC<Props> = ({
  integration,
  updateIntegrationLoading,
  regenerateLoading,
  onIntegrationUpdate,
  onRegenerateToken,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormType>();
  const [isDisabled, setIsDisabled] = useState(true);
  const [visible, setVisible] = useState(false);

  const handleValuesChange = useCallback(
    async (_: unknown, values: FormType) => {
      const hasError = await form
        .validateFields()
        .then(() => false)
        .catch((errorInfo: ValidateErrorEntity) => errorInfo.errorFields.length > 0);
      if (hasError) {
        setIsDisabled(true);
      } else {
        setIsDisabled(
          integration.name === values.name && integration.description === values.description,
        );
      }
    },
    [form, integration.description, integration.name],
  );

  const handleSubmit = useCallback(async () => {
    setIsDisabled(true);
    try {
      const values = await form.validateFields();
      values.logoUrl = "_"; // TODO: should be implemented when assets upload is ready to use
      await onIntegrationUpdate(values);
    } catch (_) {
      setIsDisabled(false);
    }
  }, [form, onIntegrationUpdate]);

  const handleRegenerateToken = useCallback(() => {
    Modal.confirm({
      title: t("Re-generate The Integration Token?"),
      content: t(
        "If you re-generate the integration token, the previous token will become invalid, and this action cannot be undone. Are you sure you want to proceed?",
      ),
      cancelText: t("Cancel"),
      okText: t("Reset"),
      onOk() {
        onRegenerateToken();
      },
    });
  }, [t, onRegenerateToken]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={integration}
      onValuesChange={handleValuesChange}>
      <Row gutter={32}>
        <Col span={11}>
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
          <StyledFormItem
            label={t("Integration Token")}
            extra={t("This is your secret token, please use as your env value.")}>
            <StyledTokenInput
              value={integration.config.token}
              contentEditable={false}
              visibilityToggle={{ visible }}
              iconRender={() => <CopyButton copyable={{ text: integration.config.token }} />}
              prefix={
                <Icon
                  icon={visible ? "eye" : "eyeInvisible"}
                  onClick={() => {
                    setVisible(prev => !prev);
                  }}
                />
              }
            />
            <Button onClick={handleRegenerateToken} loading={regenerateLoading}>
              {t("Re-generate")}
            </Button>
          </StyledFormItem>
          <Form.Item>
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={isDisabled}
              loading={updateIntegrationLoading}>
              {t("Save")}
            </Button>
          </Form.Item>
        </Col>
        <Col>
          <StyledDivider type="vertical" />
        </Col>
        <Col span={11}>
          <CodeExampleTitle>{t("Code Example")}</CodeExampleTitle>
          <CodeExample>
            curl --location --request POST <br />
            &apos;{window.REEARTH_CONFIG?.api}/models/
            <CodeImportant>“{t("your model id here")}”</CodeImportant>/items&apos;&nbsp;\
            <br />
            --header &apos;Authorization: Bearer&nbsp;
            <CodeImportant>“{t("your Integration Token here")}”</CodeImportant>&apos;
          </CodeExample>
        </Col>
      </Row>
    </Form>
  );
};

const CodeExampleTitle = styled.h2`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
`;

const CodeExample = styled.div`
  border: 1px solid #d9d9d9;
  padding: 5px 12px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
`;

const CodeImportant = styled.span`
  color: #ff4d4f;
`;

const StyledDivider = styled(Divider)`
  height: 100%;
`;

const StyledFormItem = styled(Form.Item)`
  .ant-form-item-control-input-content {
    display: flex;
    gap: 4px;
  }
`;

const StyledTokenInput = styled(Password)`
  flex: 1;
  .ant-input-prefix {
    order: 1;
    margin-left: 4px;
    color: rgb(0, 0, 0, 0.45);
    transition: all 0.3s;
    :hover {
      color: rgba(0, 0, 0, 0.88);
    }
  }
  .ant-input-suffix {
    order: 2;
  }
`;

export default MyIntegrationForm;
