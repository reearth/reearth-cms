import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import IntegrationCard from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal/integrationCard";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  open?: boolean;
  onClose?: () => void;
  onSubmit?: () => Promise<void> | void;
}

const IntegrationConnectModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const t = useT();

  return (
    <Modal
      title={t("Connect Integration")}
      visible={open}
      onCancel={() => onClose?.()}
      onOk={onSubmit}
      footer={[
        <Button key="back" onClick={() => onClose?.()}>
          {t("Cancel")}
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit}>
          {t("Connect")}
        </Button>,
      ]}>
      <ModalContent>
        <IntegrationCard title="Card title" selected={false} />
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
