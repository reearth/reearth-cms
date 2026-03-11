import styled from "@emotion/styled";
import parse from "html-react-parser";
import { JSONTree } from "react-json-tree";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { AntdColor, AntdToken, CustomColor } from "@reearth-cms/utils/style";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  infoBoxProps: any;
  infoBoxVisibility: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
};

const InfoBox: React.FC<Props> = ({
  infoBoxProps,
  infoBoxVisibility,
  title,
  description,
  onClose,
}) => {
  const theme = {
    base00: AntdColor.NEUTRAL.BG_WHITE,
    base01: CustomColor.HEADER_BG,
    base02: CustomColor.HEADER_BG,
    base03: CustomColor.HEADER_BG,
    base04: CustomColor.HEADER_BG,
    base05: CustomColor.HEADER_BG,
    base06: CustomColor.HEADER_BG,
    base07: CustomColor.HEADER_BG,
    base08: CustomColor.HEADER_BG,
    base09: CustomColor.HEADER_BG,
    base0A: CustomColor.HEADER_BG,
    base0B: CustomColor.HEADER_BG,
    base0C: CustomColor.HEADER_BG,
    base0D: CustomColor.HEADER_BG,
    base0E: CustomColor.HEADER_BG,
    base0F: CustomColor.HEADER_BG,
  };

  return (
    <>
      {infoBoxVisibility && (
        <InfoBoxWrapper color={theme.base00}>
          <Header>
            <Title>{title}</Title>
            <Button type="text" icon={<Icon icon="close" />} onClick={onClose} />
          </Header>
          <Box>
            {infoBoxProps && <JSONTree data={infoBoxProps ?? {}} theme={theme} />}
            {description && parse(description)}
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
  border-radius: ${AntdToken.RADIUS.BASE}px;
`;

const Header = styled.div`
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${AntdToken.SPACING.XS}px ${AntdToken.SPACING.SM}px;
  box-shadow: inset 0px -1px 0px ${AntdColor.NEUTRAL.BORDER_SECONDARY};
`;

const Title = styled.div`
  margin-bottom: 0;
  margin-left: ${AntdToken.SPACING.XS}px;
  color: ${AntdColor.NEUTRAL.TEXT};
  line-height: ${AntdToken.LINE_HEIGHT.BASE}px;
  font-size: ${AntdToken.FONT.SIZE_LG}px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const Box = styled.div`
  height: calc(100% - 50px);
  padding: 0 12px 0 20px;
  overflow-y: scroll;
`;

export default InfoBox;
