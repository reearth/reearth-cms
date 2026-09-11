import styled from "@emotion/styled";
import { useMemo } from "react";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import MyIntegrationCard from "@reearth-cms/components/molecules/MyIntegrations/List/Card";
import IntegrationCreationAction from "@reearth-cms/components/molecules/MyIntegrations/List/CreationAction";
import type { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { useLang, useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import DocumentationLink from "../../APIDocLinks/DocumentationLink";

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
  const lang = useLang();
  const documentUrl = useMemo<string>(
    () => (lang === "ja" ? Constant.INTEGRATIONS_API_DOCS.ja : Constant.INTEGRATIONS_API_DOCS.en),
    [lang],
  );

  return (
    <Wrapper>
      <PageHeader
        title={t("My Integrations")}
        subTitle={t("Create and test your own integration.")}
        extra={<DocumentationLink url={documentUrl} />}
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
