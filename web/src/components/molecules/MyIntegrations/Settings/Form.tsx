import styled from "@emotion/styled";
import { useCallback, useState } from "react";

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
  onIntegrationUpdate: (data: IntegrationInfo) => Promise<void>;
  onRegenerateToken: () => Promise<void>;
  regenerateLoading: boolean;
  updateIntegrationLoading: boolean;
};

type FormType = {
  description: string;
  logoUrl: string;
  name: string;
};

const MyIntegrationForm: React.FC<Props> = ({
  integration,
  onIntegrationUpdate,
  onRegenerateToken,
  regenerateLoading,
  updateIntegrationLoading,
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
      content: t(
        "If you re-generate the integration token, the previous token will become invalid, and this action cannot be undone. Are you sure you want to proceed?",
      ),
      okText: t("Reset"),
      onOk() {
        onRegenerateToken();
      },
      title: t("Re-generate The Integration Token?"),
    });
  }, [confirm, t, onRegenerateToken]);

  const api = window.REEARTH_CONFIG?.api || "";
  const codeExampleText = `curl --location --request POST '${api}/${t("<workspace_id_or_alias>")}/projects/${t("<project_id_or_alias>")}/models/${t("<model_id_or_key>")}/items' --header 'Authorization: Bearer ${t("<your_integration_token>")}'`;

  return (
    <Form
      form={form}
      initialValues={integration}
      layout="vertical"
      onValuesChange={handleValuesChange}>
      <Row gutter={32}>
        <Col span={11}>
          <Form.Item
            label={t("Integration Name")}
            name="name"
            rules={[
              {
                message: t("Please input the title of the integration!"),
                required: true,
              },
            ]}>
            <Input />
          </Form.Item>
          <Form.Item label={t("Description")} name="description">
            <TextArea maxLength={100} rows={3} showCount />
          </Form.Item>
          <StyledFormItem
            extra={t("This is your secret token, please use as your env value.")}
            label={t("Integration Token")}>
            <StyledTokenInput
              contentEditable={false}
              iconRender={() => (
                <CopyButton
                  copyable={{ text: integration.config.token }}
                  data-testid={DATA_TEST_ID.MyIntegrations__Settings__Form__TokenCopyButton}
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
              value={integration.config.token}
              visibilityToggle={{ visible }}
            />
            <Button loading={regenerateLoading} onClick={handleRegenerateToken}>
              {t("Re-generate")}
            </Button>
          </StyledFormItem>
          <Form.Item>
            <Button
              disabled={isDisabled}
              loading={updateIntegrationLoading}
              onClick={handleSubmit}
              type="primary">
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
              copyable={{ text: codeExampleText }}
              data-testid={DATA_TEST_ID.MyIntegrations__Settings__Form__CodeExampleCopyButton}
            />
            <span>curl --location --request POST </span>
            <br />
            <span>&apos;{api}/</span>
            <Typography.Text code>{t("<workspace_id_or_alias>")}</Typography.Text>
            <span>/projects/</span>
            <Typography.Text code>{t("<project_id_or_alias>")}</Typography.Text>
            <span>/models/</span>
            <Typography.Text code>{t("<model_id_or_key>")}</Typography.Text>
            <span>/items&apos;&nbsp;</span>
            <br />
            <span>--header 'Authorization: Bearer </span>
            <Typography.Text code>{t("<your_integration_token>")}</Typography.Text>
            <span>&apos;</span>
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
