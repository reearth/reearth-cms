import styled from "@emotion/styled";

import MyIntegrationsHeader from "@reearth-cms/components/molecules/MyIntegrations/Header";
import MyIntegrationsCard from "@reearth-cms/components/molecules/MyIntegrations/List/Card";
import IntegrationsCreationAction from "@reearth-cms/components/molecules/MyIntegrations/List/CreationAction";
import { useT } from "@reearth-cms/i18n";

const MyIntegrationsList: React.FC = () => {
  const t = useT();

  return (
    <Wrapper>
      <MyIntegrationsHeader title={t("My Integrations")} />
      <ListWrapper>
        <MyIntegrationsCard title="Robot Red" subTitle="Internal integration" />
        <IntegrationsCreationAction />
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

export default MyIntegrationsList;
