import styled from "@emotion/styled";

export type Props = {
  src?: string;
  title: string;
  subTitle: string;
};

const MyIntegrationCard: React.FC<Props> = ({ src, title, subTitle }) => {
  return (
    <CardWrapper>
      <Card>
        <CardImg src={src} />
        <CardTitle>{title}</CardTitle>
        <CardSubTitle>{subTitle}</CardSubTitle>
      </Card>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  padding: 12px;
`;

const Card = styled.div`
  width: 240px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  border: 1px solid #d9d9d9;
  box-shadow: 0px 2px 8px #00000026;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const CardImg = styled.img`
  width: 40px;
  height: 40px;
`;

const CardTitle = styled.h5`
  margin-top: 24px;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000000d9;
`;

const CardSubTitle = styled.h6`
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: #00000073;
`;

export default MyIntegrationCard;
