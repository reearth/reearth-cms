import styled from "@emotion/styled";
import React, { useCallback } from "react";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { fieldTypes } from "@reearth-cms/components/organisms/Project/Schema/fieldTypes";

import { FieldType } from "../../Dashboard/types";

export interface FormValues {
  name: string;
  description: string;
  key: string;
}

export interface Props {
  open?: boolean;
  selectedType: FieldType | null;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
}

const initialValues: FormValues = {
  name: "",
  description: "",
  key: "",
};

const FieldCreationModal: React.FC<Props> = ({ open, onClose, onSubmit, selectedType }) => {
  const [form] = Form.useForm();
  const { TabPane } = Tabs;

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        await onSubmit?.(values);
        onClose?.(true);
        form.resetFields();
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [form, onClose, onSubmit]);

  const handleClose = useCallback(() => {
    onClose?.(true);
  }, [onClose]);
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
        <Tabs defaultActiveKey="setting">
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
            <Form.Item name="default" extra="Enable Default value here">
              <Checkbox>Use default value</Checkbox>
            </Form.Item>
            <Form.Item name="dd" label="Set default value">
              <Input />
            </Form.Item>
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
