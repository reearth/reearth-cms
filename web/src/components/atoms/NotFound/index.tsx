import styled from "@emotion/styled";

import Typography from "@reearth-cms/components/atoms/Typography";

const NotFound: React.FC = () => {
  return (
    <Wrapper>
      <TextWrapper>
        <StyledTitle style={{ marginBottom: "6px" }}>Page Not Found</StyledTitle>
      </TextWrapper>
    </Wrapper>
  );
};

export default NotFound;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  height: 100vh;
  padding-top: 120px;
  background: #f0f2f5;
`;

const TextWrapper = styled.div`
  align-self: flex-start;
  background: linear-gradient(79.71deg, #1e2086 0%, #df3013 66.79%, #df3013 93.02%);
  padding: 0;
  border-radius: 8px;
`;

const StyledTitle = styled(Typography.Title)`
  padding: 0 40px 15px 40px;
  background: #f0f2f5;
`;
