import styled from "@emotion/styled";
import { useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import CopyButton from "@reearth-cms/components/atoms/CopyButton";
import Form, { FormInstance } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Input from "@reearth-cms/components/atoms/Input";
import Password from "@reearth-cms/components/atoms/Password";
import Select from "@reearth-cms/components/atoms/Select";
import Switch from "@reearth-cms/components/atoms/Switch";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import { FormType } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";
import { Selectors } from "@reearth-cms/selectors";

type ModelDataType = {
  id: string;
  name: string;
  public: JSX.Element;
  publicState: boolean;
  key: string;
};

type Props = {
  form: FormInstance<FormType>;
  models: Model[];
  modelsState: Record<string, boolean>;
  assetState: boolean;
  isSaveDisabled: boolean;
  hasPublishRight: boolean;
  updateLoading: boolean;
  regenerateLoading: boolean;
  apiUrl: string;
  alias: string;
  token: string;
  onValuesChange: (changedValues: Partial<FormType>, values: FormType) => void;
  onPublicUpdate: () => Promise<void>;
  onRegenerateToken: () => Promise<void>;
};

const Accessibility: React.FC<Props> = ({
  form,
  models,
  modelsState,
  assetState,
  isSaveDisabled,
  hasPublishRight,
  updateLoading,
  regenerateLoading,
  apiUrl,
  alias,
  token,
  onValuesChange,
  onPublicUpdate,
  onRegenerateToken,
}) => {
  const t = useT();
  const [visible, setVisible] = useState(false);

  const columns: TableColumnsType<ModelDataType> = useMemo(
    () => [
      {
        title: t("Model"),
        dataIndex: "name",
        key: "name",
        width: 220,
      },
      {
        title: t("Switch"),
        dataIndex: "public",
        key: "public",
        align: "center",
        width: 90,
      },
      {
        title: t("End point"),
        dataIndex: "endpoint",
        key: "endpoint",
        render: (_, modelData) => {
          const url = apiUrl + modelData.key;
          return (
            <StyledAnchor target="_blank" href={url} rel="noreferrer">
              {url}
            </StyledAnchor>
          );
        },
      },
    ],
    [apiUrl, t],
  );

  const dataSource = useMemo(() => {
    const columns: ModelDataType[] = [];
    models.forEach(m => {
      columns.push({
        id: m.id,
        name: m.name,
        key: m.key,
        publicState: modelsState[m.id],
        public: (
          <StyledFormItem name={["models", m.id]}>
            <Switch
              disabled={!hasPublishRight}
              data-testid={Selectors.accessibilityModelSwitch(m.id)}
            />
          </StyledFormItem>
        ),
      });
    });
    columns.push({
      id: "assets",
      name: t("Assets"),
      key: "assets",
      publicState: assetState,
      public: (
        <StyledFormItem name="assetPublic">
          <Switch disabled={!hasPublishRight} data-testid={Selectors.accessibilitySwitch} />
        </StyledFormItem>
      ),
    });
    return columns;
  }, [assetState, models, modelsState, t, hasPublishRight]);

  const publicScopeList = useMemo(
    () => [
      { name: t("Private"), value: "PRIVATE" },
      { name: t("Limited"), value: "LIMITED" },
      { name: t("Public"), value: "PUBLIC" },
    ],
    [t],
  );

  return (
    <InnerContent
      title={t("Accessibility")}
      flexChildren
      subtitle={t("Control the visibility scope of the Content API")}>
      <ContentSection title="">
        <Form form={form} layout="vertical" onValuesChange={onValuesChange}>
          <Form.Item
            name="scope"
            label={t("Public Scope")}
            extra={t("Choose your project public method.")}>
            <StyledSelect
              disabled={!hasPublishRight}
              data-testid={Selectors.accessibilityPublicScopeSelect}>
              {publicScopeList.map(({ value, name }) => (
                <Select.Option
                  key={value}
                  value={value}
                  data-testid={Selectors.accessibilityScopeOption(value)}>
                  {name}
                </Select.Option>
              ))}
            </StyledSelect>
          </Form.Item>
          <Form.Item
            name="alias"
            label={t("Project Alias")}
            extra={t("Edit Project Alias in Project Setting.")}>
            <StyledInput suffix={<CopyButton copyable={{ text: alias }} />} disabled />
          </Form.Item>
          {token && (
            <TokenFormItem
              label={t("Token")}
              extra={t("This is your secret token, please use as your env value.")}>
              <StyledTokenInput
                value={token}
                disabled
                visibilityToggle={{ visible }}
                iconRender={() => <CopyButton copyable={{ text: token }} />}
                prefix={
                  <Icon
                    icon={visible ? "eye" : "eyeInvisible"}
                    onClick={() => {
                      setVisible(prev => !prev);
                    }}
                  />
                }
              />
              <Button onClick={onRegenerateToken} loading={regenerateLoading}>
                {t("Re-generate")}
              </Button>
            </TokenFormItem>
          )}
          <TableWrapper>
            <Table dataSource={dataSource} columns={columns} pagination={false} />
          </TableWrapper>
          <Button
            type="primary"
            disabled={isSaveDisabled}
            onClick={onPublicUpdate}
            loading={updateLoading}
            data-testid={Selectors.accessibilitySaveChangesButton}>
            {t("Save changes")}
          </Button>
        </Form>
      </ContentSection>
    </InnerContent>
  );
};

export default Accessibility;

const maxWidth = "316px";

const StyledSelect = styled(Select)`
  max-width: ${maxWidth};
`;

const StyledInput = styled(Input)`
  max-width: ${maxWidth};
`;

const TokenFormItem = styled(Form.Item)`
  .ant-form-item-control-input-content {
    display: flex;
    gap: 4px;
  }
`;

const StyledTokenInput = styled(Password)`
  max-width: ${maxWidth};
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

const TableWrapper = styled.div`
  margin: 24px 0;
`;

const StyledAnchor = styled.a`
  text-decoration: underline;
  color: #000000d9;
`;

const StyledFormItem = styled(Form.Item)`
  margin: 0;
`;
