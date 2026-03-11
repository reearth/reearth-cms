import styled from "@emotion/styled";
import { CSSProperties } from "react";

import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

type CustomTagProps = {
  value?: number | string;
  color?: CSSProperties["color"];
};

const CustomTag: React.FC<CustomTagProps> = ({ value, color }) => {
  return (
    <CustomTagWrapper color={color ?? AntdColor.GREY.GREY_0 /* originally #BFBFBF */}>
      <span>{value ?? ""}</span>
    </CustomTagWrapper>
  );
};

const CustomTagWrapper = styled.div`
  padding: 0px 6px;
  width: 20px;
  height: 16px;
  background-color: ${props => props.color};
  color: ${AntdColor.NEUTRAL.BG_WHITE};
  border-radius: 100px;
  font-family: Roboto Mono;
  font-style: normal;
  font-weight: 400;
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  line-height: ${AntdToken.LINE_HEIGHT.SM}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default CustomTag;
