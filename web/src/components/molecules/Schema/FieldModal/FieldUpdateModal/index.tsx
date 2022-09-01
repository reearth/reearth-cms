import styled from "@emotion/styled";
import React, { useCallback, useEffect } from "react";

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

import { fieldTypes } from "../../fieldTypes";
import { Field, FieldType } from "../../types";

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
  selectedType,
  selectedField,
}) => {
  const [form] = Form.useForm();
  const { TabPane } = Tabs;

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
            <h3>Update {fieldTypes[selectedType].title}</h3>
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
            <Form.Item name="multiValue" extra="Stores a list of values instead of a single value">
              <Checkbox>Support multiple values</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane tab="Validation" key="validation">
            <FieldValidationInputs selectedType={selectedType} />
          </TabPane>
          <TabPane tab="Default value" key="defaultValue">
            <FieldDefaultInputs form={form} selectedType={selectedType}></FieldDefaultInputs>
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
