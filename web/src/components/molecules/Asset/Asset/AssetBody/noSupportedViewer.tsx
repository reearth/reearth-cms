import styled from "@emotion/styled";
import { twoTone } from "@reearth-cms/components/atoms/Icon";

const NoSupportedViewer: React.FC = () => {
  return (
    <NoSuportedViewerContainer>
      <NoSuportedViewerWrapper>
        <twoTone.exclamationCircle
          style={{
            fontSize: "32px",
            marginBottom: "10px",
          }}
          twoToneColor="#faad14"
        />
        <NoSuportedViewerText>
          Didn’t find supported viewer
        </NoSuportedViewerText>
      </NoSuportedViewerWrapper>
    </NoSuportedViewerContainer>
  );
};

const NoSuportedViewerContainer = styled.div`
  height: 240px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NoSuportedViewerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  alignitems: center;
`;

const NoSuportedViewerText = styled.span`
  font-family: Roboto;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
`;

export default NoSupportedViewer;
