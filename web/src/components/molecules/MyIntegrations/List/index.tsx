import styled from "@emotion/styled";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import MyIntegrationCard from "@reearth-cms/components/molecules/MyIntegrations/List/Card";
import IntegrationCreationAction from "@reearth-cms/components/molecules/MyIntegrations/List/CreationAction";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  integrations: Integration[];
  onIntegrationModalOpen: () => void;
  onIntegrationNavigate: (integrationId: string) => void;
};

const MyIntegrationList: React.FC<Props> = ({
  integrations,
  onIntegrationModalOpen,
  onIntegrationNavigate,
}) => {
  const t = useT();

  return (
    <Wrapper>
      <PageHeader
        title={t("My Integrations")}
        subTitle={t("Create and test your own integration.")}
      />
      <ListWrapper>
        {integrations.map((integration: Integration) => (
          <MyIntegrationCard
            key={integration.id}
            integration={integration}
            onIntegrationNavigate={onIntegrationNavigate}
          />
        ))}
        <IntegrationCreationAction onIntegrationModalOpen={onIntegrationModalOpen} />
      </ListWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  min-height: calc(100% - 16px);
  background: #fff;
  margin: 16px 16px 0;
`;

const ListWrapper = styled.div`
  border-top: 1px solid #f0f0f0;
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
`;

export default MyIntegrationList;
