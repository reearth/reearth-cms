import styled from "@emotion/styled";
import React from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import IntegrationCard from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal/integrationCrad";

export interface Props {
  open?: boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: () => Promise<void> | void;
}

const IntegrationConnectModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  return (
    <Modal
      title="Connect Integration"
      visible={open}
      onCancel={() => onClose?.(true)}
      onOk={onSubmit}
      footer={[
        <Button key="back" onClick={() => onClose?.(true)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit}>
          Connect
        </Button>,
      ]}>
      <ModalContent>
        <IntegrationCard title="Card title" selected={false}></IntegrationCard>
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
