import styled from "@emotion/styled";

import Avatar from "@reearth-cms/components/atoms/Avatar";
import DropdownAtom from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Space from "@reearth-cms/components/atoms/Space";

export type Props = {
  className?: string;
  menu: React.ReactElement | (() => React.ReactElement);
  name?: string;
};

const Dropdown: React.FC<Props> = ({ className, menu, name }) => {
  return (
    <StyledDropdown className={className} overlay={menu} trigger={["click"]}>
      <a onClick={e => e.preventDefault()}>
        <Space>
          <Avatar style={{ color: "#fff", backgroundColor: "#3F3D45" }} size={"small"}>
            {name?.charAt(0)}
          </Avatar>
          <Text>{name}</Text>
          <StyledIcon icon="caretDown" />
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
`;

const StyledIcon = styled(Icon)`
  color: #8c8c8c;
`;

const Text = styled.p`
  max-width: 300px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
