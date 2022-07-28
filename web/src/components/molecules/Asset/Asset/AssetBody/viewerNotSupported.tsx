import styled from "@emotion/styled";
import Icon from "@reearth-cms/components/atoms/Icon";

const ViewerNotSupported: React.FC = () => {
  return (
    <ViewerNotSupportedContainer>
      <ViewerNotSupportedWrapper>
        {/* TODO: should be replaced with ExclamationCircleTwoTone */}
        <Icon
          icon="exclamationCircle"
          color="#faad14"
          style={{
            fontSize: "32px",
            marginBottom: "10px",
          }}
        />
        <ViewerNotSupportedText>Not supported</ViewerNotSupportedText>
      </ViewerNotSupportedWrapper>
    </ViewerNotSupportedContainer>
  );
};

const ViewerNotSupportedContainer = styled.div`
  height: 240px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ViewerNotSupportedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  alignitems: center;
`;

const ViewerNotSupportedText = styled.span`
  font-family: Roboto;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
`;

export default ViewerNotSupported;
