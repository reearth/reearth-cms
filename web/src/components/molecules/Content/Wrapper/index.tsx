import styled from "@emotion/styled";

import Content from "@reearth-cms/components/atoms/Content";
import { Model } from "@reearth-cms/components/molecules/Schema/types";

export type Props = {
  model?: Model;
  modelsMenu: React.ReactNode;
  children?: React.ReactNode;
};

const ContentWrapper: React.FC<Props> = ({ modelsMenu: ModelsMenu, children }) => (
  <PaddedContent>
    <LeftPaneWrapper>{ModelsMenu}</LeftPaneWrapper>
    <ContentChild>{children}</ContentChild>
  </PaddedContent>
);

const LeftPaneWrapper = styled.div`
  width: 200px;
`;

const PaddedContent = styled(Content)`
  margin: 16px;
  background-color: #fff;
  display: flex;
  min-height: 100%;
`;

const ContentChild = styled.div`
  flex: 1;
  background-color: #fff;
  padding: 24px;
`;

export default ContentWrapper;
