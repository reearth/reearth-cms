import styled from "@emotion/styled";
import { ItemType } from "antd/lib/menu/hooks/useItems";
import React from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";

export interface Props {
  defaultSelectedKeys?: string[];
}

const topItems: ItemType[] = [
  { label: "Model 1", key: "home" },
  { label: "Model 2", key: "schema" },
  { label: "Model 3", key: "content" },
  { label: "Model 4", key: "asset" },
  { label: "Model 5", key: "request" },
];

export interface Props {
  defaultSelectedKeys?: string[];
  handleModalOpen: () => void;
}

const SchemaMenu: React.FC<Props> = ({ defaultSelectedKeys, handleModalOpen }) => {
  const onClick = () => {};

  return (
    <SchemaStyledMenu>
      <SchemaStyledTitle>Schema</SchemaStyledTitle>
      <SchemaAction>
        <SchemaStyledMenuTitle>Models</SchemaStyledMenuTitle>
        <SchemaAddButton
          onClick={handleModalOpen}
          color="#1890FF"
          icon={<Icon icon="plus" />}
          type="text">
          Add
        </SchemaAddButton>
      </SchemaAction>
      <Menu
        style={{ height: "100%" }}
        onClick={onClick}
        defaultSelectedKeys={defaultSelectedKeys}
        mode="inline"
        items={topItems}
      />
    </SchemaStyledMenu>
  );
};

const SchemaAction = styled.div`
  display: flex;
  padding: 24px;
  justify-content: space-between;
  align-items: center;
`;

const SchemaAddButton = styled(Button)`
  color: #1890ff;
  &:hover,
  &:active,
  &:focus {
    color: #1890ff;
  }
`;

const SchemaStyledMenuTitle = styled.h1`
  margin: 0;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.45);
`;

const SchemaStyledTitle = styled.h2`
  padding: 24px;
`;

const SchemaStyledMenu = styled.div`
  background-color: #fff;
  height: 100%;
`;

export default SchemaMenu;
