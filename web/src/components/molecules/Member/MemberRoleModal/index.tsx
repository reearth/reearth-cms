import { RoleUnion } from "@reearth-cms/components/organisms/Settings/Workspace/hooks";
import { Form, Modal, Select } from "antd";
import React, { useCallback } from "react";

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

  const initialValues: FormValues = {
    userId: member?.userId,
    role: member?.role,
  };

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async (values) => {
        console.log(member?.userId, values.role);

        await onSubmit?.(member?.userId, values?.role);
        onClose?.(true);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }, [form, onClose, onSubmit]);

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
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Please input the role!" }]}
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
