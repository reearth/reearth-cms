import React, { useCallback, useEffect, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
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
  loading: boolean;
  onClose: () => void;
  onSubmit: (userId: string, role: RoleUnion) => Promise<void>;
}

const MemberRoleModal: React.FC<Props> = ({ open, member, loading, onClose, onSubmit }) => {
  const t = useT();
  const { Option } = Select;
  const [form] = Form.useForm<FormValues>();
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    form.setFieldsValue({
      role: member.role,
    });
  }, [form, member]);

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    try {
      await onSubmit(member.userId, values.role);
      onClose();
      form.resetFields();
    } catch (error) {
      console.error(error);
    }
  }, [member, form, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  const handleSelect = useCallback(
    (value: string) => {
      setIsDisabled(value === member.role);
    },
    [member.role],
  );

  return (
    <Modal
      title={t("Role Settings")}
      open={open}
      onCancel={handleClose}
      footer={[
        <Button onClick={handleClose} disabled={loading}>
          {t("Cancel")}
        </Button>,
        <Button type="primary" loading={loading} onClick={handleSubmit} disabled={isDisabled}>
          {t("OK")}
        </Button>,
      ]}>
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
          <Select placeholder={t("select role")} onSelect={handleSelect}>
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
