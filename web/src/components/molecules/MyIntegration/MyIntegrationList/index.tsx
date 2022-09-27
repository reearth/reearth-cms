import styled from "@emotion/styled";

import IntegrationCreationAction from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationList/IntegrationCreationAction";
import MyIntegrationCard from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationList/MyIntegrationCard";

import MyIntegrationHeader from "../MyIntegrationHeader";

const MyIntegrationList: React.FC = () => {
  return (
    <Wrapper>
      <MyIntegrationHeader />
      <ListWrapper>
        <MyIntegrationCard title="Robot Red" subTitle="Internal integration" />
        <IntegrationCreationAction />
      </ListWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 12px;
  background: #fff;
  min-height: 100%;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
`;

export default MyIntegrationList;
