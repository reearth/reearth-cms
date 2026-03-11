import styled from "@emotion/styled";

import Sider, { SiderProps } from "@reearth-cms/components/atoms/Sider";
import { AntdColor, CustomColor } from "@reearth-cms/utils/style";

const Sidebar: React.FC<SiderProps> = ({ collapsible = true, ...siderProps }) => {
  return <StyledSidebar collapsible={collapsible} {...siderProps} />;
};

export default Sidebar;

const StyledSidebar = styled(Sider)`
  && {
    background-color: ${AntdColor.NEUTRAL.BG_WHITE};
    padding-bottom: 38px;
  }
  .ant-layout-sider-trigger {
    background-color: ${AntdColor.NEUTRAL.BG_WHITE};
    border-top: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
    border-right: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
    color: ${CustomColor.SIDEBAR_TEXT};
    text-align: left;
    padding: 0 20px;
    margin: 0;
    height: 38px;
    line-height: 38px;
    cursor: pointer;
  }
  .ant-layout-sider-children {
    border-right: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  }
  .ant-menu-inline {
    border-right: none !important;

    & > li {
      padding: 0 20px;
    }
  }
  .ant-menu-vertical {
    border-right: none;
  }
`;
