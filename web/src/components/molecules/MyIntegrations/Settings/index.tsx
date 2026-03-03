import styled from "@emotion/styled";

import Content from "@reearth-cms/components/atoms/Content";
import DangerZone from "@reearth-cms/components/molecules/MyIntegrations/Settings/DangerZone";
import MyIntegrationForm from "@reearth-cms/components/molecules/MyIntegrations/Settings/Form";
import {
  Integration,
  IntegrationInfo,
} from "@reearth-cms/components/molecules/MyIntegrations/types";

type Props = {
  integration: Integration;
  onIntegrationDelete: () => Promise<void>;
  onIntegrationUpdate: (data: IntegrationInfo) => Promise<void>;
  onRegenerateToken: () => Promise<void>;
  regenerateLoading: boolean;
  updateIntegrationLoading: boolean;
};

const MyIntegrationSettings: React.FC<Props> = ({
  integration,
  onIntegrationDelete,
  onIntegrationUpdate,
  onRegenerateToken,
  regenerateLoading,
  updateIntegrationLoading,
}) => {
  return (
    <Wrapper>
      <MyIntegrationForm
        integration={integration}
        onIntegrationUpdate={onIntegrationUpdate}
        onRegenerateToken={onRegenerateToken}
        regenerateLoading={regenerateLoading}
        updateIntegrationLoading={updateIntegrationLoading}
      />
      <DangerZone onIntegrationDelete={onIntegrationDelete} />
    </Wrapper>
  );
};

export default MyIntegrationSettings;

const Wrapper = styled(Content)`
  display: flex;
  flex-direction: column;
  height: calc(100% - 32px);
`;
