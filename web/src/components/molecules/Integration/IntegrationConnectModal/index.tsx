import styled from "@emotion/styled";
import React, { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";

import IntegrationCard from "./integrationCrad";

export interface FormValues {
  name: string;
}

export interface Props {
  open?: boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
}

const IntegrationConnectModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const handleSubmit = useCallback(() => {}, [onClose, onSubmit]);

  return (
    <Modal
      title="Connect Integration"
      visible={open}
      onCancel={() => onClose?.(true)}
      onOk={handleSubmit}
      footer={[
        <Button key="back" onClick={() => onClose?.(true)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Connect
        </Button>,
      ]}>
      <ModalContent>
        <IntegrationCard selected={true} src="asd" title="Hello"></IntegrationCard>
        <IntegrationCard selected={false} src="asd" title="Hello"></IntegrationCard>
        <IntegrationCard selected={false} src="asd" title="Hello"></IntegrationCard>
        <IntegrationCard selected={false} src="asd" title="Hello"></IntegrationCard>
      </ModalContent>
    </Modal>
  );
};

const ModalContent = styled.div`
  max-height: 274px;
  overflow-y: scroll;
  overflow-x: hidden;
`;

export default IntegrationConnectModal;
