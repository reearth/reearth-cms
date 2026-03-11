import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

export type FormValues = {
  items: string[];
};

export type Props = {
  text: string;
};

const WarningText: React.FC<Props> = ({ text }) => {
  return (
    <RequestWarning>
      <Icon icon="exclamationCircle" />
      <p>{text}</p>
    </RequestWarning>
  );
};

const RequestWarning = styled.div`
  .anticon {
    float: left;
    margin-right: 8px;
    font-size: ${AntdToken.FONT.SIZE_LG}px;
    color: ${AntdColor.GOLD.GOLD_5};
  }
  p {
    display: block;
    overflow: hidden;
    color: ${AntdColor.NEUTRAL.TEXT};
    font-weight: 500;
    font-size: ${AntdToken.FONT.SIZE}px;
    line-height: 1.4;
    margin-top: 2px;
  }
`;

export default WarningText;
