import styled from "@emotion/styled";
import { ReactNode } from "react";

export type Props = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
};

const ComplexInnerContents: React.FC<Props> = ({ left, center, right }) => {
  return (
    <PaddedContent>
      <Main>
        {left}
        {center}
      </Main>
      <Right>{right}</Right>
    </PaddedContent>
  );
};

export default ComplexInnerContents;

const PaddedContent = styled.div`
  display: flex;
  margin: 16px 0 0 16px;
  min-height: calc(100vh - 66px);
`;

const Main = styled.div`
  display: flex;
  margin-right: 10px;
  flex: 1;
`;

const Right = styled.div`
  // overflow-y: auto;
`;
