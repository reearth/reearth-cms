import styled from "@emotion/styled";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";

import DropdownRender from "./DropdownRender";

type Props = {
  filter: string;
};

const FilterDropdown: React.FC<Props> = ({ filter }) => {
  return (
    <Dropdown
      key={filter}
      dropdownRender={() => <DropdownRender filter={filter} />}
      trigger={["click"]}
      placement="bottomLeft"
      arrow>
      <Badge offset={[-3, 3]} color="blue" dot>
        <StyledButton type="text">{filter}</StyledButton>
      </Badge>
    </Dropdown>
  );
};

const StyledButton = styled(Button)`
  color: rgba(0, 0, 0, 0.45);
  background-color: #f8f8f8;
  margin: 0 5px;
`;

export default FilterDropdown;
