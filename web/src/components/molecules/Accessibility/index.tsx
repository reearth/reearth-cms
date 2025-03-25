import styled from "@emotion/styled";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import CopyButton from "@reearth-cms/components/atoms/CopyButton";
import Form from "@reearth-cms/components/atoms/Form";
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

type ModelDataType = {
  key: string;
  name: string;
  id: string | string[];
  endpoint: string;
};

type Props = {
  initialValues: FormType;
  models: Pick<Model, "id" | "name" | "key">[];
  hasPublishRight: boolean;
  updateLoading: boolean;
  regenerateLoading: boolean;
  apiUrl: string;
  alias: string;
  token: string;
  onPublicUpdate: (
    settings: FormType,
    models: { modelId: string; status: boolean }[],
  ) => Promise<void>;
  onRegenerateToken: () => Promise<void>;
};

const Accessibility: React.FC<Props> = ({
  initialValues,
  models,
  hasPublishRight,
  updateLoading,
  regenerateLoading,
  apiUrl,
  alias,
  token,
  onPublicUpdate,
  onRegenerateToken,
}) => {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  const [form] = Form.useForm<FormType>();
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const changedModels = useRef(new Map<string, boolean>());

  const handleValuesChange = useCallback(
    (changedValues: Partial<FormType>, values: FormType) => {
      if (changedValues?.models) {
        const modelId = Object.keys(changedValues.models)[0];
        if (changedModels.current.has(modelId)) {
          changedModels.current.delete(modelId);
        } else {
          changedModels.current.set(modelId, changedValues.models[modelId]);
        }
      }
      if (
        initialValues.scope === values.scope &&
        initialValues.assetPublic === values.assetPublic &&
        changedModels.current.size === 0
      ) {
        setIsSaveDisabled(true);
      } else {
        setIsSaveDisabled(false);
      }
    },
    [initialValues],
  );

  const columns: TableColumnsType<ModelDataType> = useMemo(
    () => [
      {
        key: "name",
        title: t("Model"),
        dataIndex: "name",
        width: 220,
      },
      {
        key: "id",
        title: t("Switch"),
        dataIndex: "id",
        align: "center",
        width: 90,
        render: id => (
          <StyledFormItem name={id}>
            <Switch disabled={!hasPublishRight} />
          </StyledFormItem>
        ),
      },
      {
        title: t("End point"),
        dataIndex: "endpoint",
        key: "endpoint",
        render: url => (
          <StyledAnchor target="_blank" href={url} rel="noreferrer">
            {url}
          </StyledAnchor>
        ),
      },
    ],
    [hasPublishRight, t],
  );

  const dataSource = useMemo(() => {
    const columns: ModelDataType[] = [];
    models.forEach(m => {
      columns.push({
        key: m.key,
        name: m.name,
        id: ["models", m.id],
        endpoint: apiUrl + m.key,
      });
    });
    columns.push({
      key: "assets",
      name: t("Assets"),
      id: "assetPublic",
      endpoint: apiUrl + "assets",
    });
    return columns;
  }, [models, t, apiUrl]);

  const publicScopeList = useMemo(
    () => [
      { name: t("Private"), value: "PRIVATE" },
      { name: t("Limited"), value: "LIMITED" },
      { name: t("Public"), value: "PUBLIC" },
    ],
    [t],
  );
  const handleSave = useCallback(async () => {
    try {
      await onPublicUpdate(
        form.getFieldsValue(),
        Array.from(changedModels.current, ([modelId, status]) => ({
          modelId,
          status,
        })),
      );
      changedModels.current.clear();
      setIsSaveDisabled(true);
    } catch (e) {
      console.error(e);
    }
  }, [form, onPublicUpdate]);

  return (
    <InnerContent
      title={t("Accessibility")}
      flexChildren
      subtitle={t("Control the visibility scope of the Content API")}>
      <ContentSection title="">
        <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
          <Form.Item
            name="scope"
            label={t("Public Scope")}
            extra={t("Choose your project public method.")}>
            <StyledSelect disabled={!hasPublishRight}>
              {publicScopeList.map(({ value, name }) => (
                <Select.Option key={value} value={value}>
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
                data-testid="token"
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
            onClick={handleSave}
            loading={updateLoading}>
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
