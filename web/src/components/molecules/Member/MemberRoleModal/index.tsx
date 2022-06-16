import { RoleUnion } from "@reearth-cms/components/organisms/Settings/Workspace/hooks";
import { Form, Modal, Select } from "antd";
import React, { useCallback, useEffect } from "react";

export interface FormValues {
  userId: string;
  role: string;
}

export interface Props {
  open?: boolean;
  member?: any;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (userId: string, role: RoleUnion) => Promise<void>;
}

const MemberRoleModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  member,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      userId: member?.userId,
      role: member?.role,
    });
  }, [form, member]);

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async (values) => {
        await onSubmit?.(member?.userId, values?.role);
        onClose?.(true);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }, [form, onClose, onSubmit, member?.userId]);

  const handleClose = useCallback(() => {
    form.resetFields();
    onClose?.(true);
  }, [form, onClose]);

  return (
    <Modal
      title="Role Settings"
      visible={open}
      onCancel={handleClose}
      onOk={handleSubmit}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          userId: member?.userId,
          role: member?.role,
        }}
      >
        <Form.Item
          name="role"
          label="Role"
          rules={[
            {
              required: true,
              message: "Please input the appropriate role for this member!",
            },
          ]}
        >
          <Select placeholder="select role">
            <Option value="OWNER">Owner</Option>
            <Option value="WRITER">Writer</Option>
            <Option value="READER">Reader</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MemberRoleModal;
