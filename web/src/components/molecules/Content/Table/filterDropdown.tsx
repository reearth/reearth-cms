import styled from "@emotion/styled";
import { useState } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import {
  DefaultFilterValueType,
  DropdownFilterType,
} from "@reearth-cms/components/molecules/Content/Table/types";

import DropdownRender from "./DropdownRender";

type Props = {
  filter: DropdownFilterType;
  index: number;
  defaultValue: DefaultFilterValueType;
};

const FilterDropdown: React.FC<Props> = ({ filter, index, defaultValue: value }) => {
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Dropdown
      key={filter.title}
      dropdownRender={() => (
        <DropdownRender
          filter={filter}
          index={index}
          close={close}
          defaultValue={value}
          open={open}
          isFilter={true}
        />
      )}
      trigger={["click"]}
      placement="bottomLeft"
      arrow
      open={open}
      onOpenChange={handleOpenChange}>
      <Badge offset={[-3, 3]} color="blue" dot>
        <StyledButton type="text">{filter.title}</StyledButton>
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
