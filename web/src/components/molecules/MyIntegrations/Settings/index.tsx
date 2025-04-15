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
  updateIntegrationLoading: boolean;
  regenerateLoading: boolean;
  onIntegrationUpdate: (data: IntegrationInfo) => Promise<void>;
  onIntegrationDelete: () => Promise<void>;
  onRegenerateToken: () => Promise<void>;
};

const MyIntegrationSettings: React.FC<Props> = ({
  integration,
  updateIntegrationLoading,
  regenerateLoading,
  onIntegrationUpdate,
  onIntegrationDelete,
  onRegenerateToken,
}) => {
  return (
    <Wrapper>
      <MyIntegrationForm
        integration={integration}
        updateIntegrationLoading={updateIntegrationLoading}
        regenerateLoading={regenerateLoading}
        onIntegrationUpdate={onIntegrationUpdate}
        onRegenerateToken={onRegenerateToken}
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
