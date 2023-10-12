import styled from "@emotion/styled";
import type { MenuProps } from "antd";
import React, { useMemo, useState } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Popover from "@reearth-cms/components/atoms/Popover";
import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";

export type Props = { contentTableColumns?: ProColumns<ContentTableField>[] };

const Filter: React.FC<Props> = ({ contentTableColumns }) => {
  enum FilterOptions {
    Is = "is",
    IsNot = "is not",
    Contains = "contains",
    NotContain = "doesn't contain",
    IsEmpty = "is empty",
    IsNotEmpty = "is not empty",
  }
  const filterValues: FilterOptions[] = Object.values(FilterOptions);
  const options: { value: string; label: string }[] = [];
  filterValues.forEach(value => {
    options.push({ value: value, label: value });
  });

  const [popoverTitle, setPopoverTitle] = useState<string>("");
  const [open, setOpen] = useState(false);

  const itemClick = (title: string) => {
    setPopoverTitle(title);
    setOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const FilterWayField = () => {
    return (
      <>
        <PopoverHead>
          <PopoverTitle>{popoverTitle}</PopoverTitle>
          <Select defaultValue={options[0].value} style={{ width: 138 }} options={options} />
        </PopoverHead>
        <PopoverBody>
          <Input placeholder="Enter the value" />
        </PopoverBody>
        <PopoverFoot>
          <Space>
            <Button>Cancel</Button>
            <Button type="primary">Confirm</Button>
          </Space>
        </PopoverFoot>
      </>
    );
  };

  const items: MenuProps["items"] = useMemo(() => {
    return contentTableColumns?.slice(1).map(item => ({
      label: item.title,
      key: item.key,
      onClick: () => itemClick(item.title as string),
    })) as MenuProps["items"];
  }, [contentTableColumns]);

  return (
    <>
      <ButtonWrapper>
        <Popover
          showArrow={false}
          content={FilterWayField}
          trigger="click"
          placement="bottomLeft"
          overlayStyle={{ paddingTop: 0 }}
          open={open}
          onOpenChange={handleOpenChange}>
          <Badge dot color="#1890FF" offset={[-5, 5]}>
            <HighlightedStyledButton type="text">Filter</HighlightedStyledButton>
          </Badge>
        </Popover>
      </ButtonWrapper>
      <ButtonWrapper>
        <Dropdown
          menu={{ items }}
          trigger={["click"]}
          dropdownRender={menu => (
            <DropdownRender>
              <InputWrapper>
                <Input placeholder="Filter by..." />
              </InputWrapper>
              {React.cloneElement(menu as React.ReactElement, { style: menuStyle })}
            </DropdownRender>
          )}>
          <a onClick={e => e.preventDefault()}>
            <StyledButton icon={<Icon icon="plus" />} type="text">
              Filter
            </StyledButton>
          </a>
        </Dropdown>
      </ButtonWrapper>
    </>
  );
};

export default Filter;

const PopoverHead = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const PopoverBody = styled.div`
  margin-top: 8px;
`;

const PopoverFoot = styled.div`
  margin-top: 15px;
  text-align: right;
`;

const PopoverTitle = styled.p`
  margin: 0;
  min-width: 169px;
  padding-right: 10px;
`;

const ButtonWrapper = styled.div`
  margin-left: 5px;
`;

const InputWrapper = styled.div`
  padding: 8px 10px;
`;

const StyledButton = styled(Button)`
  color: #00000073;
  :hover {
    color: #00000073;
    background-color: #fafafa;
  }
  :focus {
    color: #00000073;
  }
`;

const HighlightedStyledButton = styled(StyledButton)`
  background-color: #fafafa;
`;

const DropdownRender = styled.div`
  margin-top: 8px;
  background-color: #fff;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
`;

const menuStyle: React.CSSProperties = {
  boxShadow: "none",
  maxHeight: "340px",
  overflowY: "auto",
};
