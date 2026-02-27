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
  loading: boolean;
  member: UserMember;
  onClose: () => void;
  onUpdateRole: (userId: string, role: Role) => Promise<void>;
  open: boolean;
};

const MemberRoleModal: React.FC<Props> = ({ loading, member, onClose, onUpdateRole, open }) => {
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
      footer={[
        <Button disabled={loading} onClick={handleClose}>
          {t("Cancel")}
        </Button>,
        <Button disabled={isDisabled} loading={loading} onClick={handleSubmit} type="primary">
          {t("OK")}
        </Button>,
      ]}
      onCancel={handleClose}
      open={open}
      title={t("Role Settings")}>
      <Form
        form={form}
        initialValues={{
          role: member.role,
        }}
        layout="vertical">
        <Form.Item
          label={t("Role")}
          name="role"
          rules={[
            {
              message: t("Please input the appropriate role for this member!"),
              required: true,
            },
          ]}>
          <Select onSelect={handleSelect} placeholder={t("select role")}>
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
