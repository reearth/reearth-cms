import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import IntegrationCard from "@reearth-cms/components/molecules/Integration/IntegrationConnectModal/IntegrationCard";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";
import { useCallback, useState } from "react";

type Props = {
  integrations?: Integration[];
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (integration?: Integration) => Promise<void>;
};

const IntegrationConnectModal: React.FC<Props> = ({
  integrations,
  open,
  loading,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const [selectedIntegration, SetSelectedIntegration] = useState<Integration | undefined>();

  const handleIntegrationSelect = useCallback(
    (integration: Integration) => {
      SetSelectedIntegration(integration);
    },
    [SetSelectedIntegration],
  );

  return (
    <Modal
      afterClose={() => SetSelectedIntegration(undefined)}
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
          onClick={() => onSubmit(selectedIntegration)}
          loading={loading}>
          {t("Connect")}
        </Button>,
      ]}>
      <ModalContent>
        {integrations?.map(integration => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            integrationSelected={integration.id === selectedIntegration?.id}
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
