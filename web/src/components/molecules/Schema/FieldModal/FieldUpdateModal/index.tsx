import styled from "@emotion/styled";
import React, { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import FieldDefaultInputs from "@reearth-cms/components/molecules/Schema/FieldModal/FieldDefaultInputs";
import FieldValidationInputs from "@reearth-cms/components/molecules/Schema/FieldModal/FieldValidationInputs";
import { SchemaFieldTypePropertyInput } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { validateKey } from "@reearth-cms/utils/regex";

import { Field, FieldType, fieldTypes } from "../../types";

export interface FormValues {
  fieldId: string;
  title: string;
  description: string;
  key: string;
  typeProperty: SchemaFieldTypePropertyInput;
}

export interface Props {
  open?: boolean;
  selectedType: FieldType;
  selectedField?: Field | null;
  handleFieldKeyUnique: (key: string, fieldId?: string) => boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
}

const initialValues: FormValues = {
  fieldId: "",
  title: "",
  description: "",
  key: "",
  typeProperty: { text: { defaultValue: "", maxLength: 0 } },
};

const FieldUpdateModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  handleFieldKeyUnique,
  selectedType,
  selectedField,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const { TabPane } = Tabs;
  const selectedValues = Form.useWatch("values", form);

  useEffect(() => {
    form.setFieldsValue({
      fieldId: selectedField?.id,
      title: selectedField?.title,
      description: selectedField?.description,
      key: selectedField?.key,
      defaultValue:
        selectedField?.typeProperty.defaultValue ||
        selectedField?.typeProperty.selectDefaultValue ||
        selectedField?.typeProperty.integerDefaultValue,
      min: selectedField?.typeProperty.min,
      max: selectedField?.typeProperty.max,
      maxLength: selectedField?.typeProperty.maxLength,
      values: selectedField?.typeProperty.values,
    });
  }, [form, selectedField]);

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        if (selectedType === "Text") {
          values.typeProperty = {
            text: { defaultValue: values.defaultValue, maxLength: values.maxLength },
          };
        } else if (selectedType === "TextArea") {
          values.typeProperty = {
            textArea: { defaultValue: values.defaultValue, maxLength: values.maxLength },
          };
        } else if (selectedType === "MarkdownText") {
          values.typeProperty = {
            markdownText: { defaultValue: values.defaultValue, maxLength: values.maxLength },
          };
        } else if (selectedType === "Asset") {
          values.typeProperty = {
            asset: { defaultValue: values.defaultValue.uid },
          };
        } else if (selectedType === "Select") {
          values.typeProperty = {
            select: { defaultValue: values.defaultValue, values: values.values },
          };
        } else if (selectedType === "Integer") {
          values.typeProperty = {
            integer: { defaultValue: +values.defaultValue, min: +values.min, max: +values.max },
          };
        } else if (selectedType === "URL") {
          values.typeProperty = {
            url: { defaultValue: values.defaultValue },
          };
        }

        await onSubmit?.({
          ...values,
          fieldId: selectedField?.id,
        });
        form.resetFields();
        onClose?.(true);
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [form, onClose, onSubmit, selectedType, selectedField?.id]);

  const handleClose = useCallback(() => {
    form.resetFields();
    onClose?.(true);
  }, [onClose, form]);

  return (
    <Modal
      title={
        selectedType ? (
          <FieldThumbnail>
            <StyledIcon
              icon={fieldTypes[selectedType].icon}
              color={fieldTypes[selectedType].color}
            />{" "}
            <h3>
              {t("Update")} {fieldTypes[selectedType].title}
            </h3>
          </FieldThumbnail>
        ) : null
      }
      visible={open}
      onCancel={handleClose}
      onOk={handleSubmit}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Tabs defaultActiveKey="settings">
          <TabPane tab={t("Setting")} key="setting" forceRender>
            <Form.Item
              name="title"
              label={t("Display name")}
              rules={[{ required: true, message: t("Please input the display name of field!") }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="key"
              label="Field Key"
              extra={t(
                "Field key must be unique and at least 5 characters long. It can only contain letters, numbers, underscores and dashes.",
              )}
              rules={[
                { required: true, message: t("Please input the key of the field!") },
                {
                  message: t("Key is not valid"),
                  validator: async (_, value) => {
                    if (!validateKey(value)) return Promise.reject();
                    const isKeyAvailable = handleFieldKeyUnique(value, selectedField?.id);
                    if (isKeyAvailable) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject();
                    }
                  },
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item requiredMark="optional" name="description" label={t("Description")}>
              <TextArea rows={3} showCount maxLength={100} />
            </Form.Item>
            {selectedType === "Select" && (
              <>
                <div style={{ marginBottom: "8px" }}>{t("Set Options")}</div>
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
                      {fields.map((field, _) => (
                        <Form.Item required={false} key={field.key}>
                          <Form.Item
                            {...field}
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[
                              {
                                required: true,
                                whitespace: true,
                                message: t("Please input value or delete this field."),
                              },
                            ]}
                            noStyle>
                            <Input
                              placeholder={t("Option value")}
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
                          {t("New")}
                        </Button>
                        <Form.ErrorList errors={errors} />
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </>
            )}
            <Form.Item
              name="multiValue"
              extra={t("Stores a list of values instead of a single value")}>
              <Checkbox>{t("Support multiple values")}</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane tab={t("Validation")} key="validation" forceRender>
            <FieldValidationInputs selectedType={selectedType} />
          </TabPane>
          <TabPane tab={t("Default value")} key="defaultValue" forceRender>
            <FieldDefaultInputs selectedValues={selectedValues} selectedType={selectedType} />
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
    color: #000000d9;
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

export default FieldUpdateModal;
