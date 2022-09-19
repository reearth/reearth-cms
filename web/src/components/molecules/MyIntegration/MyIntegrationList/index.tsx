import styled from "@emotion/styled";

import IntegrationCreationAction from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationList/IntegrationCreationAction";
import MyIntegrationCard from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationList/MyIntegrationCard";

import { Integration } from "../types";

export interface Props {
  integrations?: Integration[];
}

const MyIntegrationList: React.FC<Props> = ({ integrations }) => {
  return (
    <ListWrapper>
      {integrations?.map((integration: Integration) => (
        <MyIntegrationCard
          key={integration.id}
          title={integration.name}
          description={integration.description}
          logoUrl={integration.logoUrl}
        />
      ))}
      <IntegrationCreationAction />
    </ListWrapper>
  );
};

const ListWrapper = styled.div`
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
`;

export default MyIntegrationList;
