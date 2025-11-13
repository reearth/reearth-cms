import React, { useCallback, useEffect, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { Role } from "@reearth-cms/components/molecules/Member/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

const { Option } = Select;

type FormValues = {
  role: Role;
};

type Props = {
  open: boolean;
  member: UserMember;
  loading: boolean;
  onClose: () => void;
  onUpdateRole: (userId: string, role: Role) => Promise<void>;
};

const MemberRoleModal: React.FC<Props> = ({ open, member, loading, onClose, onUpdateRole }) => {
  const t = useT();
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
      await onUpdateRole(member.userId, values.role);
      onClose();
      form.resetFields();
    } catch (error) {
      console.error(error);
    }
  }, [member, form, onUpdateRole, onClose]);

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
      data-testid="member-role-modal"
      footer={[
        <Button onClick={handleClose} disabled={loading} data-testid="member-role-cancel-button">
          {t("Cancel")}
        </Button>,
        <Button
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          disabled={isDisabled}
          data-testid="member-role-ok-button">
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
          <Select
            placeholder={t("select role")}
            onSelect={handleSelect}
            data-testid="member-role-select">
            <Option value="OWNER">{t("Owner")}</Option>
            <Option value="MAINTAINER">{t("Maintainer")}</Option>
            <Option value="WRITER">{t("Writer")}</Option>
            <Option value="READER">{t("Reader")}</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MemberRoleModal;
