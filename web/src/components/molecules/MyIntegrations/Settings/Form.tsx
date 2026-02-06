import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Col from "@reearth-cms/components/atoms/Col";
import CopyButton from "@reearth-cms/components/atoms/CopyButton";
import Divider from "@reearth-cms/components/atoms/Divider";
import Form, { ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import { useModal } from "@reearth-cms/components/atoms/Modal";
import Password from "@reearth-cms/components/atoms/Password";
import Row from "@reearth-cms/components/atoms/Row";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import Typography from "@reearth-cms/components/atoms/Typography";
import {
  Integration,
  IntegrationInfo,
} from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

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

type CodeExampleItem = {
  type: "normal" | "highlight";
  text: string;
  lineBreak: boolean;
};

const MyIntegrationForm: React.FC<Props> = ({
  integration,
  updateIntegrationLoading,
  regenerateLoading,
  onIntegrationUpdate,
  onRegenerateToken,
}) => {
  const t = useT();
  const { confirm } = useModal();
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
    confirm({
      title: t("Re-generate The Integration Token?"),
      content: t(
        "If you re-generate the integration token, the previous token will become invalid, and this action cannot be undone. Are you sure you want to proceed?",
      ),
      okText: t("Reset"),
      onOk() {
        onRegenerateToken();
      },
    });
  }, [confirm, t, onRegenerateToken]);

  const codeExampleTest = useMemo<CodeExampleItem[]>(
    () => [
      {
        type: "normal",
        text: "curl --location --request POST ",
        lineBreak: true,
      },
      {
        type: "normal",
        text: "'",
        lineBreak: false,
      },
      {
        type: "normal",
        text: window.REEARTH_CONFIG?.api || "",
        lineBreak: false,
      },
      {
        type: "normal",
        text: "/",
        lineBreak: false,
      },
      {
        type: "highlight",
        text: t("<workspace_id_or_alias>"),
        lineBreak: false,
      },
      {
        type: "normal",
        text: "/projects/",
        lineBreak: false,
      },
      {
        type: "highlight",
        text: t("<project_id_or_alias>"),
        lineBreak: false,
      },
      {
        type: "normal",
        text: "/models/",
        lineBreak: false,
      },
      {
        type: "highlight",
        text: t("<model_id_or_key>"),
        lineBreak: false,
      },
      {
        type: "normal",
        text: "/items' ",
        lineBreak: true,
      },
      {
        type: "normal",
        text: "--header 'Authorization: Bearer ",
        lineBreak: false,
      },
      {
        type: "highlight",
        text: t("<your_integration_token>"),
        lineBreak: false,
      },
      {
        type: "normal",
        text: "'",
        lineBreak: false,
      },
    ],
    [t],
  );

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
              iconRender={() => (
                <CopyButton
                  data-testid={DATA_TEST_ID.MyIntegrations__Settings__Form__TokenCopyButton}
                  copyable={{ text: integration.config.token }}
                />
              )}
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
            <StyledCopyButton
              data-testid={DATA_TEST_ID.MyIntegrations__Settings__Form__CodeExampleCopyButton}
              copyable={{ text: codeExampleTest.map(item => item.text).join("") }}
            />
            {codeExampleTest.map((item, index) => (
              <span key={index}>
                {item.type === "highlight" ? (
                  <Typography.Text code>{item.text}</Typography.Text>
                ) : (
                  <span>{item.text}</span>
                )}
                {item.lineBreak && <br />}
              </span>
            ))}
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

const CodeExample = styled.pre`
  border: 1px solid #d9d9d9;
  padding: 5px 12px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
  position: relative;
  white-space: pre-wrap;
  word-wrap: break-word;
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

const StyledCopyButton = styled(CopyButton)`
  position: absolute;
  top: 5px;
  right: 12px;
  background: #ffffff;
`;

export default MyIntegrationForm;
