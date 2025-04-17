import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import IntegrationCard from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal/IntegrationCard";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";

type IntegrationType = Pick<Integration, "id" | "name">;

type Props = {
  integrations?: IntegrationType[];
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (integrationId: string) => Promise<void>;
};

const IntegrationConnectModal: React.FC<Props> = ({
  integrations,
  open,
  loading,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType>();

  const handleIntegrationSelect = useCallback(
    (integration: IntegrationType) => {
      setSelectedIntegration(integration);
    },
    [setSelectedIntegration],
  );

  const handleConnect = useCallback(async () => {
    if (!selectedIntegration) return;
    try {
      await onSubmit(selectedIntegration.id);
      onClose();
    } catch (e) {
      console.error(e);
    }
  }, [onClose, onSubmit, selectedIntegration]);

  return (
    <Modal
      afterClose={() => setSelectedIntegration(undefined)}
      title={t("Connect Integration")}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>
          {t("Cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!selectedIntegration}
          onClick={handleConnect}
          loading={loading}>
          {t("Connect")}
        </Button>,
      ]}>
      <ModalContent>
        {integrations?.map(integration => (
          <IntegrationCard
            key={integration.id}
            name={integration.name}
            isSelected={integration.id === selectedIntegration?.id}
            onClick={() => handleIntegrationSelect(integration)}
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
