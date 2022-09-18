import styled from "@emotion/styled";

import IntegrationCreationAction from "@reearth-cms/components/molecules/MyIntegration/IntegrationCreationAction";
import MyIntegrationCard from "@reearth-cms/components/molecules/MyIntegration/MyIntegrationCard";

const MyIntegrationList: React.FC = () => {
  return (
    <ListWrapper>
      <MyIntegrationCard title="Robot Red" subTitle="Internal integration" />
      <MyIntegrationCard title="Robot Red" subTitle="Internal integration" />
      <MyIntegrationCard title="Robot Red" subTitle="Internal integration" />
      <MyIntegrationCard title="Robot Red" subTitle="Internal integration" />
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
