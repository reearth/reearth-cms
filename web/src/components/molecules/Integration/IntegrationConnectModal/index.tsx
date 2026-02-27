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
  loading: boolean;
  onClose: () => void;
  onSubmit: (integrationId: string) => Promise<void>;
  open: boolean;
};

const IntegrationConnectModal: React.FC<Props> = ({
  integrations,
  loading,
  onClose,
  onSubmit,
  open,
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
      footer={[
        <Button disabled={loading} key="back" onClick={onClose}>
          {t("Cancel")}
        </Button>,
        <Button
          disabled={!selectedIntegration}
          key="submit"
          loading={loading}
          onClick={handleConnect}
          type="primary">
          {t("Connect")}
        </Button>,
      ]}
      onCancel={onClose}
      open={open}
      title={t("Connect Integration")}>
      <ModalContent>
        {integrations?.map(integration => (
          <IntegrationCard
            isSelected={integration.id === selectedIntegration?.id}
            key={integration.id}
            name={integration.name}
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
