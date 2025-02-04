import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { WorkspaceIntegration } from "@reearth-cms/components/molecules/Integration/types";
import { Role } from "@reearth-cms/components/molecules/Member/types";
import { useT } from "@reearth-cms/i18n";

type FormValues = {
  role: Role;
};

type Props = {
  selectedIntegration?: WorkspaceIntegration;
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (role: Role) => Promise<void>;
};

const IntegrationSettingsModal: React.FC<Props> = ({
  selectedIntegration,
  open,
  loading,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const { Option } = Select;
  const [form] = Form.useForm<FormValues>();
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    form.setFieldsValue({
      role: selectedIntegration?.role,
    });
  }, [form, selectedIntegration]);

  const handleSubmit = useCallback(async () => {
    setIsDisabled(true);
    try {
      const values = await form.validateFields();
      await onSubmit(values.role);
      onClose();
    } catch (_) {
      setIsDisabled(false);
    }
  }, [form, onClose, onSubmit]);

  const handleSelect = useCallback(
    (value: string) => {
      setIsDisabled(value === selectedIntegration?.role);
    },
    [selectedIntegration?.role],
  );

  const handleAfterClose = useCallback(() => {
    form.setFieldsValue({
      role: selectedIntegration?.role,
    });
    setIsDisabled(true);
  }, [form, selectedIntegration?.role]);

  return (
    <Modal
      afterClose={handleAfterClose}
      title={t("Integration Setting")}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>
          {t("Cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={isDisabled}
          loading={loading}>
          {t("Save")}
        </Button>,
      ]}>
      <Wrapper>
        <Conetnt>
          <LogoWrapper>
            <Icon icon="api" size={32} color="#b8b8b8" />
          </LogoWrapper>
          <Info>
            <Name>{selectedIntegration?.name}</Name>
            <Description>{selectedIntegration?.description}</Description>
          </Info>
        </Conetnt>
      </Wrapper>
      <StyledForm
        form={form}
        layout="vertical"
        initialValues={{ role: selectedIntegration?.role }}
        requiredMark={false}>
        <Form.Item
          name="role"
          label={t("Role")}
          rules={[
            {
              required: true,
              message: t("Please input the appropriate role for this integration!"),
            },
          ]}>
          <StyledSelect placeholder={t("select role")} onSelect={handleSelect}>
            <Option value="READER">{t("Reader")}</Option>
            <Option value="WRITER">{t("Writer")}</Option>
            <Option value="MAINTAINER">{t("Maintainer")}</Option>
            <Option value="OWNER">{t("Owner")}</Option>
          </StyledSelect>
        </Form.Item>
      </StyledForm>
    </Modal>
  );
};

const Wrapper = styled.div`
  padding: 24px 0;
`;

const Conetnt = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  width: fit-content;
  min-width: 70%;
  max-width: 100%;
`;

const LogoWrapper = styled.div`
  border-radius: 4px;
  border: 1px solid #f0f0f0;
`;

const Info = styled.div`
  min-width: 0;
`;

const Name = styled.h3`
  margin: 0;
`;

const Description = styled.p`
  margin: 0;
  font-size: 12px;
  color: #9a9a9a;
`;

const StyledForm = styled(Form<FormValues>)`
  padding-left: 12px;
`;

const StyledSelect = styled(Select<Role>)`
  max-width: 25%;
`;

export default IntegrationSettingsModal;
