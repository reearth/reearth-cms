import styled from "@emotion/styled";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import MyIntegrationCard from "@reearth-cms/components/molecules/MyIntegrations/List/Card";
import IntegrationCreationAction from "@reearth-cms/components/molecules/MyIntegrations/List/CreationAction";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

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
    <Wrapper data-testid={DATA_TEST_ID.MyIntegrations__List__Wrapper}>
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
  min-height: calc(100% - ${AntdToken.SPACING.BASE}px);
  background: ${AntdColor.NEUTRAL.BG_WHITE};
  margin: ${AntdToken.SPACING.BASE}px ${AntdToken.SPACING.BASE}px 0;
`;

const ListWrapper = styled.div`
  border-top: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  padding: ${AntdToken.SPACING.SM}px;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
`;

export default MyIntegrationList;
