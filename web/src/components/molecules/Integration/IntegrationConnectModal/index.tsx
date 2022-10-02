import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import IntegrationCard from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal/IntegrationCard";
import { Integration } from "@reearth-cms/components/molecules/Integration/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  integrations: Integration[];
  selectedIntegration?: Integration;
  open?: boolean;
  onClose?: () => void;
  onSubmit?: () => Promise<void> | void;
  onIntegrationSelect: (integration: Integration) => void;
};

const IntegrationConnectModal: React.FC<Props> = ({
  integrations,
  selectedIntegration,
  open,
  onClose,
  onSubmit,
  onIntegrationSelect,
}) => {
  const t = useT();

  return (
    <Modal
      title={t("Connect Integration")}
      visible={open}
      onCancel={onClose}
      onOk={onSubmit}
      footer={[
        <Button key="back" onClick={onClose}>
          {t("Cancel")}
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit}>
          {t("Connect")}
        </Button>,
      ]}>
      <ModalContent>
        {integrations.map(integration => (
          <IntegrationCard
            onIntegrationSelect={onIntegrationSelect}
            key={integration.id}
            integration={integration}
            selectedIntegration={integration.id === selectedIntegration?.id}
          />
        ))}
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
