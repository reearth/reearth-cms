import styled from "@emotion/styled";

import DropdownAtom, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";

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
      dropdownRender={menu => <StyledDropdownMenu>{menu}</StyledDropdownMenu>}
      {...props}>
      <a
        onClick={e => e.preventDefault()}
        data-testid={personal ? "header-account-dropdown" : "header-workspace-dropdown"}>
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
  color: #fff;
  background-color: #1d1d1d;

  .anticon,
  .anticon-caret-down {
    color: #dbdbdb;
  }
`;
const StyledDropdownMenu = styled.div`
  .ant-dropdown-menu {
    background-color: #ffffff !important;
    min-width: 190px;
    max-width: 205px;
    padding: 4px 0;
  }
  .ant-dropdown-menu-item-divider {
    background-color: #303030;
  }
  .ant-dropdown-menu-item-group-title,
  .ant-dropdown-menu-item,
  .ant-dropdown-menu-submenu-title {
    color: #000000 !important;
  }
  .ant-dropdown-menu-item-group-title {
    font-weight: 400;
    font-size: 12px;
    line-height: 22px;
    user-select: none;
    color: #000000;
  }
  .ant-dropdown-menu-item-group-list {
    max-height: 50vh;
    overflow: hidden auto;
  }
  .ant-dropdown-menu-item-active {
    background-color: #1d1d1d;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StyledIcon = styled(Icon)`
  color: #000000;
`;

const Text = styled.p`
  max-width: 300px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
`;
