import styled from "@emotion/styled";
import Upload from "antd/lib/upload/Upload";
import React, { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { fieldTypes } from "@reearth-cms/components/organisms/Project/Schema/fieldTypes";
import { SchemaFieldTypePropertyInput, SchemaFiledType } from "@reearth-cms/gql/graphql-client-api";

import { FieldType } from "../../Dashboard/types";

export interface FormValues {
  title: string;
  description: string;
  key: string;
  multiValue: boolean;
  unique: boolean;
  required: boolean;
  type: SchemaFiledType;
  typeProperty: SchemaFieldTypePropertyInput;
}

export interface Props {
  open?: boolean;
  selectedType: FieldType | null;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
}

const initialValues: FormValues = {
  title: "",
  description: "",
  key: "",
  multiValue: false,
  unique: false,
  required: false,
  type: SchemaFiledType["Text"],
  typeProperty: { text: { defaultValue: "", maxLength: 0 } },
};

const FieldCreationModal: React.FC<Props> = ({ open, onClose, onSubmit, selectedType }) => {
  const [form] = Form.useForm();
  const { TabPane } = Tabs;
  const { Option } = Select;

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        values.type = selectedType;
        if (selectedType === "Text") {
          values.typeProperty = {
            text: { defaultValue: values.defaultValue, maxLength: values.maxLength },
          };
        }
        if (selectedType === "TextArea") {
          values.typeProperty = {
            textArea: { defaultValue: values.defaultValue, maxLength: values.maxLength },
          };
        }
        if (selectedType === "MarkdownText") {
          values.typeProperty = {
            markdownText: { defaultValue: values.defaultValue, maxLength: values.maxLength },
          };
        }
        if (selectedType === "Asset") {
          values.typeProperty = {
            asset: { defaultValue: values.defaultValue.uid },
          };
        }
        if (selectedType === "Select") {
          values.typeProperty = {
            select: { defaultValue: values.defaultValue, values: values.values },
          };
        }
        if (selectedType === "Integer") {
          values.typeProperty = {
            integer: { defaultValue: +values.defaultValue, min: +values.min, max: +values.max },
          };
        }
        if (selectedType === "URL") {
          values.typeProperty = {
            url: { defaultValue: values.defaultValue },
          };
        }

        await onSubmit?.(values);
        form.resetFields();
        onClose?.(true);
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [form, onClose, onSubmit, selectedType]);

  const handleClose = useCallback(() => {
    form.resetFields();
    onClose?.(true);
  }, [onClose, form]);
  let additionalFields = <></>;
  if (selectedType === "Text") {
    additionalFields = (
      <>
        <Form.Item name="defaultValue" label="Set default value">
          <Input />
        </Form.Item>
        <Form.Item name="maxLength" label="Set maximum length">
          <Input type="number" />
        </Form.Item>
      </>
    );
  }
  if (selectedType === "TextArea" || selectedType === "MarkdownText") {
    additionalFields = (
      <>
        <Form.Item name="defaultValue" label="Set default value">
          <TextArea rows={3} showCount />
        </Form.Item>
        <Form.Item name="maxLength" label="Set maximum length">
          <Input type="number" />
        </Form.Item>
      </>
    );
  }
  if (selectedType === "Asset") {
    additionalFields = (
      <>
        <Form.Item name="defaultValue" label="Set default value">
          <Upload action="/upload.do" listType="picture-card">
            <div>
              <Icon icon="link" />
              <div style={{ marginTop: 8 }}>Asset</div>
            </div>
          </Upload>
        </Form.Item>
      </>
    );
  }
  let defaultInput = <></>;
  if (selectedType === "Select") {
    additionalFields = (
      <>
        <Form.Item name="defaultValue" label="Set default value">
          <Select>
            {form.getFieldValue("values").map((value: string) => (
              <Option key={value} value={value}>
                {value}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </>
    );

    defaultInput = (
      <>
        <div style={{ marginBottom: "8px" }}>Set Options</div>
        <Form.List
          name="values"
          rules={[
            {
              validator: async (_, values) => {
                if (!values || values.length < 1) {
                  return Promise.reject(new Error("At least 1 option"));
                }
              },
            },
          ]}>
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item required={false} key={field.key}>
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Please input value or delete this field.",
                      },
                    ]}
                    noStyle>
                    <Input
                      placeholder="Option value"
                      style={{ width: "80%", marginRight: "8px" }}
                    />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <Icon icon="minusCircle" onClick={() => remove(field.name)} />
                  ) : null}
                </Form.Item>
              ))}
              <Form.Item>
                <Button type="primary" onClick={() => add()} icon={<Icon icon="plus" />}>
                  New
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
      </>
    );
  }
  if (selectedType === "Integer") {
    additionalFields = (
      <>
        <Form.Item name="defaultValue" label="Set default value">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="min" label="Set minimum value">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="max" label="Set maximum value">
          <Input type="number" />
        </Form.Item>
      </>
    );
  }

  if (selectedType === "URL") {
    additionalFields = (
      <>
        <Form.Item name="defaultValue" label="Set default value">
          <Input />
        </Form.Item>
      </>
    );
  }
  return (
    <Modal
      title={
        selectedType ? (
          <FieldThumbnail>
            <StyledIcon
              icon={fieldTypes[selectedType].icon}
              color={fieldTypes[selectedType].color}
            />{" "}
            <h3>Create {fieldTypes[selectedType].title}</h3>
          </FieldThumbnail>
        ) : null
      }
      visible={open}
      onCancel={handleClose}
      onOk={handleSubmit}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Tabs defaultActiveKey="settings">
          <TabPane tab="Setting" key="setting">
            <Form.Item
              name="title"
              label="Display name"
              rules={[{ required: true, message: "Please input the display name of field!" }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="key"
              label="Field Key"
              rules={[{ required: true, message: "Please input the key of field!" }]}>
              <Input />
            </Form.Item>
            <Form.Item requiredMark="optional" name="description" label="Description">
              <TextArea rows={3} showCount maxLength={100} />
            </Form.Item>
            {defaultInput}
            <Form.Item name="multiValue" extra="Stores a list of values instead of a single value">
              <Checkbox>Support multiple values</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane tab="Validation" key="validation">
            <Form.Item name="required" extra="Prevents saving an entry if this field is empty">
              <Checkbox>Make field required</Checkbox>
            </Form.Item>
            <Form.Item
              name="unique"
              extra="Ensures that a multiple entries can't have the same value for this field">
              <Checkbox>Set field as unique</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane tab="Default value" key="defaultValue">
            {additionalFields}
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

const FieldThumbnail = styled.div`
  display: flex;
  align-items: center;
  h3 {
    margin: 0;
    margin-left: 12px;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: rgba(0, 0, 0, 0.85);
  }
`;

const StyledIcon = styled(Icon)`
  border: 1px solid #f0f0f0;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  span {
    display: inherit;
  }
`;

export default FieldCreationModal;
