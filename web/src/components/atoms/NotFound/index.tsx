import styled from "@emotion/styled";

import Typography from "@reearth-cms/components/atoms/Typography";

const NotFound: React.FC = () => {
  const { Title } = Typography;
  return (
    <Wrapper>
      <Typography>
        <Title>Page Not Found</Title>
      </Typography>
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
