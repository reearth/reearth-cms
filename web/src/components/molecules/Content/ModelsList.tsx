import styled from "@emotion/styled";
import type { MenuInfo } from "rc-menu/lib/interface";
import React from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";
import { Model } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  defaultSelectedKeys?: string[];
}

export interface Props {
  title: string;
  defaultSelectedKeys?: string[];
  models?: Model[];
  handleModalOpen: () => void;
  selectModel: (modelId: string) => void;
}

const ModelsList: React.FC<Props> = ({
  defaultSelectedKeys,
  models,
  handleModalOpen,
  selectModel,
  title,
}) => {
  const t = useT();
  const onClick = (e: MenuInfo) => {
    selectModel(e.key);
  };

  return (
    <SchemaStyledMenu>
      <SchemaStyledTitle>{title}</SchemaStyledTitle>
      <SchemaAction>
        <SchemaStyledMenuTitle>{t("Models")}</SchemaStyledMenuTitle>
        <SchemaAddButton onClick={handleModalOpen} icon={<Icon icon="plus" />} type="text">
          {t("Add")}
        </SchemaAddButton>
      </SchemaAction>
      <Menu
        onClick={onClick}
        defaultSelectedKeys={defaultSelectedKeys}
        mode="inline"
        items={models?.map(model => ({ label: model.name, key: model.id }))}
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
  color: #00000073;
`;

const SchemaStyledTitle = styled.h2`
  padding: 24px;
`;

const SchemaStyledMenu = styled.div`
  background-color: #fff;
  height: 100%;
  border-right: 1px solid #f0f0f0;
`;

export default ModelsList;
