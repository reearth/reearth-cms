import styled from "@emotion/styled";

import IntegrationCreationAction from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationList/IntegrationCreationAction";
import MyIntegrationCard from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationList/MyIntegrationCard";
import { useT } from "@reearth-cms/i18n";

import MyIntegrationHeader from "../MyIntegrationHeader";

const MyIntegrationList: React.FC = () => {
  const t = useT();

  return (
    <Wrapper>
      <MyIntegrationHeader title={t("My Integration")} />
      <ListWrapper>
        <MyIntegrationCard title="Robot Red" subTitle="Internal integration" />
        <IntegrationCreationAction />
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
