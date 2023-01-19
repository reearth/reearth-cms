import styled from "@emotion/styled";
import { JSONTree } from "react-json-tree";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";

type Props = {
  infoBoxProps: any;
  infoBoxVisibility: boolean;
  title?: string;
  onClose: () => void;
};

const InfoBox: React.FC<Props> = ({ infoBoxProps, infoBoxVisibility, title, onClose }) => {
  const theme = {
    base00: "#ffffff",
    base01: "#1d1d1d",
    base02: "#1d1d1d",
    base03: "#1d1d1d",
    base04: "#1d1d1d",
    base05: "#1d1d1d",
    base06: "#1d1d1d",
    base07: "#1d1d1d",
    base08: "#1d1d1d",
    base09: "#1d1d1d",
    base0A: "#1d1d1d",
    base0B: "#1d1d1d",
    base0C: "#1d1d1d",
    base0D: "#1d1d1d",
    base0E: "#1d1d1d",
    base0F: "#1d1d1d",
  };

  return (
    <>
      {infoBoxVisibility && (
        <InfoBoxWrapper color={theme.base00}>
          <Header>
            <Title color={theme.base01}>{title}</Title>
            <Button type="text" icon={<Icon icon="close" />} onClick={onClose} />
          </Header>
          <Box>
            <JSONTree data={infoBoxProps ?? {}} theme={theme} />
          </Box>
        </InfoBoxWrapper>
      )}
    </>
  );
};

const InfoBoxWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40%;
  height: 90%;
  max-width: 500px;
  max-height: 800px;
  text-align: left;
  background-color: ${({ color }) => color};
  border-radius: 6px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  box-shadow: inset 0px -1px 0px #f0f0f0;
`;

const Title = styled.div`
  margin-bottom: 0;
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.85);
  line-height: 22px;
  font-size: 16px;
`;

const Box = styled.div`
  padding: 0 12px 0 20px;
  overflow-y: scroll;
`;

export default InfoBox;
