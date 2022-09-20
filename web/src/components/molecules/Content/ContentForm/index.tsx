import styled from "@emotion/styled";
import Upload from "antd/lib/upload/Upload";
import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";

import { FieldType, Model } from "../../Schema/types";

export interface Props {
  model?: Model;
  onSubmit: (data: {
    schemaID: string;
    fields: {
      schemaFieldID: string;
      type: FieldType;
      value: string;
    }[];
  }) => Promise<void>;
  handleItemUpdate: (data: {
    itemID: string;
    fields: {
      schemaFieldID: string;
      type: FieldType;
      value: string;
    }[];
  }) => Promise<void>;
}

const ContentForm: React.FC<Props> = ({ model, onSubmit, handleItemUpdate }) => {
  const t = useT();
  const [form] = Form.useForm();
  const { projectId, workspaceId, schemaID, modelId, itemID } = useParams();
  const navigate = useNavigate();

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        console.log(values);
        const fields: { schemaFieldID: string; type: FieldType; value: string }[] = [];
        for (const [key, value] of Object.entries(values)) {
          fields.push({
            value: (value || "") as string,
            schemaFieldID: key,
            type: model?.schema.fields.find(field => field.id === key)?.type as FieldType,
          });
        }
        if (!itemID) await onSubmit?.({ schemaID: model?.schema.id as string, fields });
        else await handleItemUpdate?.({ itemID: itemID as string, fields });

        navigate(`/workspaces/${workspaceId}/${projectId}/content/${modelId}/${schemaID}`);
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [
    form,
    onSubmit,
    model?.schema.fields,
    model?.schema.id,
    modelId,
    navigate,
    projectId,
    schemaID,
    workspaceId,
    itemID,
  ]);

  return (
    <FormWrapper>
      <StyledContentForm form={form} layout="vertical" initialValues={{}}>
        {model?.schema.fields.map(field =>
          field.type === "TextArea" || field.type === "MarkdownText" ? (
            <Form.Item name={field.id} label={field.title}>
              <TextArea rows={3} showCount />
            </Form.Item>
          ) : field.type === "Integer" ? (
            <Form.Item name={field.id} label={field.title}>
              <Input type="number" />
            </Form.Item>
          ) : field.type === "Asset" ? (
            <Form.Item name={field.id} label={field.title}>
              <Upload action="/upload.do" listType="picture-card">
                <div>
                  <Icon icon="link" />
                  <div style={{ marginTop: 8 }}>{t("Asset")}</div>
                </div>
              </Upload>
            </Form.Item>
          ) : field.type === "Select" ? (
            <></> // <SelectField selectedValues={selectedValues} />
          ) : field.type === "URL" ? (
            <Form.Item
              name={field.id}
              label={field.title}
              rules={[
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
          ) : (
            <Form.Item name={field.id} label={field.title}>
              <Input />
            </Form.Item>
          ),
        )}
        {model?.schema.fields && model?.schema.fields.length > 0 && !itemID ? (
          <Form.Item>
            <Button type="primary" htmlType="submit" onClick={handleSubmit}>
              {t("Submit")}
            </Button>
          </Form.Item>
        ) : null}
        {model?.schema.fields && model?.schema.fields.length > 0 && itemID ? (
          <Form.Item>
            <Button type="primary" htmlType="submit" onClick={handleSubmit}>
              {t("Update")}
            </Button>
          </Form.Item>
        ) : null}
      </StyledContentForm>
    </FormWrapper>
  );
};

const FormWrapper = styled.div`
  display: flex;
`;

const StyledContentForm = styled(Form)`
  flex: 0 0 50%;
`;

export default ContentForm;
