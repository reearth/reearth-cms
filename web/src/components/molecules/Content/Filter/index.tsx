import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import type { MenuProps } from "antd";
import { Button, Dropdown } from "antd";
import React from "react";

import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";

export type Props = { contentTableColumns?: ProColumns<ContentTableField>[] };

const Filter: React.FC<Props> = ({ contentTableColumns }) => {
  const items: MenuProps["items"] = contentTableColumns?.slice(1).map(item => ({
    label: item.title,
    key: item.key,
  })) as MenuProps["items"];

  return (
    <StyledDropdown
      menu={{ items }}
      trigger={["click"]}
      dropdownRender={menu => (
        <DropdownRender>
          <FilteringTextInput placeholder="Filter by..." />
          {React.cloneElement(menu as React.ReactElement, { style: menuStyle })}
        </DropdownRender>
      )}>
      <a onClick={e => e.preventDefault()}>
        <StyledButton icon={<PlusOutlined />} type="text">
          Filter
        </StyledButton>
      </a>
    </StyledDropdown>
  );
};

export default Filter;

const StyledDropdown = styled(Dropdown)`
  margin-left: 5px;
`;

const FilteringTextInput = styled.input`
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  line-height: 2;
  margin: 8px 10px;
  padding: 0 8px;
  outline: none;
  ::placeholder {
    color: #d9d9d9;
  }
`;

const StyledButton = styled(Button)`
  color: #bfbfbf;
  :hover {
    color: #bfbfbf;
    background-color: #fafafa;
  }
  :focus {
    color: #bfbfbf;
  }
`;

const DropdownRender = styled.div`
  background-color: #fff;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
`;

const menuStyle: React.CSSProperties = {
  boxShadow: "none",
  maxHeight: "340px",
  overflowY: "auto",
};
