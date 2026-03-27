import styled from "@emotion/styled";

import DropdownAtom, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { AntdColor, AntdToken, CustomColor } from "@reearth-cms/utils/style";

type Props = {
  items: MenuProps["items"];
  name?: string;
  profilePictureUrl?: string;
  personal: boolean;
  showName?: boolean;
  showArrow?: boolean;
};

const Dropdown: React.FC<Props> = ({
  items,
  name,
  profilePictureUrl,
  personal,
  showName,
  showArrow,
  ...props
}) => {
  return (
    <StyledDropdown
      menu={{ items }}
      trigger={["click"]}
      popupRender={menu => <StyledDropdownMenu>{menu}</StyledDropdownMenu>}
      {...props}>
      <a onClick={e => e.preventDefault()}>
        <Space>
          <UserAvatar
            username={name ?? ""}
            profilePictureUrl={personal ? profilePictureUrl : ""}
            shape={personal ? "circle" : "square"}
            size={"small"}
          />
          {showName && <Text>{name}</Text>}
          {showArrow && <StyledIcon icon="caretDown" />}
        </Space>
      </a>
    </StyledDropdown>
  );
};

export default Dropdown;

const StyledDropdown = styled(DropdownAtom)`
  padding-left: 10px;
  color: ${AntdColor.NEUTRAL.BG_WHITE};
  background-color: ${CustomColor.HEADER_BG};

  .anticon,
  .anticon-caret-down {
    color: ${CustomColor.HEADER_TEXT};
  }
`;
const StyledDropdownMenu = styled.div`
  .ant-dropdown-menu {
    background-color: ${AntdColor.NEUTRAL.BG_WHITE} !important;
    min-width: 190px;
    max-width: 205px;
    padding: ${AntdToken.SPACING.XXS}px 0;
  }
  .ant-dropdown-menu-item-divider {
    background-color: ${CustomColor.HEADER_DIVIDER};
  }
  .ant-dropdown-menu-item-group-title,
  .ant-dropdown-menu-item,
  .ant-dropdown-menu-submenu-title {
    color: ${AntdColor.GREY.GREY_8} !important;
  }
  .ant-dropdown-menu-item-group-title {
    font-weight: ${AntdToken.FONT_WEIGHT.NORMAL};
    font-size: ${AntdToken.FONT.SIZE_SM}px;
    line-height: ${AntdToken.LINE_HEIGHT.BASE}px;
    user-select: none;
    color: ${AntdColor.GREY.GREY_8};
  }
  .ant-dropdown-menu-item-group-list {
    max-height: 50vh;
    overflow: hidden auto;
  }
  .ant-dropdown-menu-item-active {
    background-color: ${CustomColor.HEADER_BG};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StyledIcon = styled(Icon)`
  color: ${AntdColor.GREY.GREY_8};
`;

const Text = styled.p`
  max-width: 300px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${AntdToken.FONT_WEIGHT.BOLD};
`;
