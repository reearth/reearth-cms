import styled from "@emotion/styled";
import React, { useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { FormInstance } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Input from "@reearth-cms/components/atoms/Input";
import Select from "@reearth-cms/components/atoms/Select";
import Switch from "@reearth-cms/components/atoms/Switch";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { FormType } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";

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
  loading: boolean;
  apiUrl: string;
  handleValuesChange: (changedValues: Partial<FormType>, values: FormType) => void;
  handlePublicUpdate: () => Promise<void>;
};

const Accessibility: React.FC<Props> = ({
  form,
  models,
  modelsState,
  assetState,
  isSaveDisabled,
  loading,
  apiUrl,
  handleValuesChange,
  handlePublicUpdate,
}) => {
  const t = useT();

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
          if (modelData.publicState) {
            const url = apiUrl + modelData.key;
            return (
              <StyledAnchor target="_blank" href={url} rel="noreferrer">
                {url}
              </StyledAnchor>
            );
          }
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
            <Switch />
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
          <Switch />
        </StyledFormItem>
      ),
    });
    return columns;
  }, [assetState, models, modelsState, t]);

  const publicScopeList = useMemo(
    () => [
      { name: t("Private"), value: "PRIVATE" },
      { name: t("Public"), value: "PUBLIC" },
    ],
    [t],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(form.getFieldValue("alias"));
  }, [form]);

  return (
    <InnerContent title={t("Accessibility")} flexChildren>
      <ContentSection title="">
        <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
          <ItemsWrapper>
            <Form.Item
              name="scope"
              label={t("Public Scope")}
              extra={t(
                "Choose the scope of your project. This affects all the models shown below that are switched on.",
              )}>
              <Select>
                {publicScopeList.map(({ value, name }) => (
                  <Select.Option key={value} value={value}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="alias" label={t("Project Alias")}>
              <StyledInput
                suffix={
                  <Tooltip title={t("Alias copied!!")} trigger={"click"}>
                    <StyledIcon icon="copy" onClick={handleCopy} />
                  </Tooltip>
                }
                disabled
              />
            </Form.Item>
          </ItemsWrapper>
          <TableWrapper>
            <Table dataSource={dataSource} columns={columns} pagination={false} />
          </TableWrapper>
          <Button
            type="primary"
            disabled={isSaveDisabled}
            onClick={handlePublicUpdate}
            loading={loading}>
            {t("Save changes")}
          </Button>
        </Form>
      </ContentSection>
    </InnerContent>
  );
};

export default Accessibility;

const ItemsWrapper = styled.div`
  max-width: 304px;
`;

const TableWrapper = styled.div`
  margin: 24px 0;
`;

const StyledAnchor = styled.a`
  text-decoration: underline;
  color: #000000d9;
`;

const StyledIcon = styled(Icon)`
  transition: all 0.3s;
  color: rgb(0, 0, 0, 0.45);
  :hover {
    color: rgba(0, 0, 0, 0.88);
  }
`;

const StyledFormItem = styled(Form.Item)`
  margin: 0;
`;

const StyledInput = styled(Input)`
  color: inherit !important;
  background-color: inherit !important;
`;
