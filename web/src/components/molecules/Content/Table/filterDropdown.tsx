import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useCallback, useState } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Space from "@reearth-cms/components/atoms/Space";
import {
  DefaultFilterValueType,
  DropdownFilterType,
} from "@reearth-cms/components/molecules/Content/Table/types";
import { ConditionInput, CurrentView } from "@reearth-cms/components/molecules/View/types";

import DropdownRender from "./DropdownRender";

type Props = {
  currentView: CurrentView;
  defaultValue: DefaultFilterValueType;
  filter: DropdownFilterType;
  filterRemove: (index: number) => void;
  index: number;
  isFilterOpen: boolean;
  onFilterChange: (filter?: ConditionInput[]) => void;
  setCurrentView: Dispatch<SetStateAction<CurrentView>>;
};

const FilterDropdown: React.FC<Props> = ({
  currentView,
  defaultValue,
  filter,
  filterRemove,
  index,
  isFilterOpen,
  onFilterChange,
  setCurrentView,
}) => {
  const [open, setOpen] = useState(isFilterOpen);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  const remove = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      filterRemove(index);
    },
    [index, filterRemove],
  );

  return (
    <Dropdown
      arrow={false}
      dropdownRender={() => (
        <DropdownRender
          close={close}
          currentView={currentView}
          defaultValue={defaultValue}
          filter={filter}
          index={index}
          isFilter={true}
          onFilterChange={onFilterChange}
          open={open}
          setCurrentView={setCurrentView}
        />
      )}
      key={filter.title}
      onOpenChange={handleOpenChange}
      open={open}
      placement="bottomLeft"
      trigger={["click"]}>
      <Badge color="blue" dot offset={[-3, 3]}>
        <StyledButton type="text">
          <Space size={10}>
            <Title>{filter.title}</Title>
            <div onClick={remove}>
              <StyledIcon icon="close" size={12} />
            </div>
          </Space>
        </StyledButton>
      </Badge>
    </Dropdown>
  );
};

export default FilterDropdown;

const StyledButton = styled(Button)`
  color: rgba(0, 0, 0, 0.45);
  background-color: #f8f8f8;
`;

const Title = styled.div`
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledIcon = styled(Icon)`
  color: rgba(0, 0, 0, 0.45);
  :hover {
    color: rgba(0, 0, 0, 0.85);
  }
`;
