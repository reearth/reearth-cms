import styled from "@emotion/styled";

import MyIntegrationHeader from "@reearth-cms/components/molecules/MyIntegration/Header";
import MyIntegrationCard from "@reearth-cms/components/molecules/MyIntegration/List/Card";
import IntegrationCreationAction from "@reearth-cms/components/molecules/MyIntegration/List/CreationAction";
import { Integration } from "@reearth-cms/components/molecules/MyIntegration/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  integrations?: Integration[];
  onIntegrationModalOpen: () => void;
};

const MyIntegrationList: React.FC<Props> = ({ integrations, onIntegrationModalOpen }) => {
  const t = useT();

  return (
    <Wrapper>
      <MyIntegrationHeader title={t("My Integration")} />
      <ListWrapper>
        {integrations?.map((integration: Integration) => (
          <MyIntegrationCard key={integration.id} integration={integration} />
        ))}
        <IntegrationCreationAction onIntegrationModalOpen={onIntegrationModalOpen} />
      </ListWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background: #fff;
  min-height: 100%;
`;

const ListWrapper = styled.div`
  border-top: 1px solid #f0f0f0;
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
`;

export default MyIntegrationList;
