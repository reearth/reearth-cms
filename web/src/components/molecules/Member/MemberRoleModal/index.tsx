import React, { useCallback, useEffect } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { RoleUnion } from "@reearth-cms/components/molecules/Member/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

interface FormValues {
  role: RoleUnion;
}

interface Props {
  open: boolean;
  member: UserMember;
  onClose: () => void;
  onSubmit: (userId: string, role: RoleUnion) => Promise<void>;
}

const MemberRoleModal: React.FC<Props> = ({ open, member, onClose, onSubmit }) => {
  const t = useT();
  const { Option } = Select;
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    form.setFieldsValue({
      role: member.role,
    });
  }, [form, member]);

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        await onSubmit(member.userId, values.role);
        onClose();
        form.resetFields();
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [member, form, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  return (
    <Modal title={t("Role Settings")} open={open} onCancel={handleClose} onOk={handleSubmit}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          role: member.role,
        }}>
        <Form.Item
          name="role"
          label={t("Role")}
          rules={[
            {
              required: true,
              message: t("Please input the appropriate role for this member!"),
            },
          ]}>
          <Select placeholder={t("select role")}>
            <Option value="OWNER">{t("Owner")}</Option>
            <Option value="WRITER">{t("Writer")}</Option>
            <Option value="MAINTAINER">{t("Maintainer")}</Option>
            <Option value="READER">{t("Reader")}</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MemberRoleModal;
