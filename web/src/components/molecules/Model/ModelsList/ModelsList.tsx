import styled from "@emotion/styled";
import type { MenuInfo } from "rc-menu/lib/interface";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";
import { Model } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  className?: string;
  title?: string;
  defaultSelectedKeys?: string[];
  models?: Model[];
  collapsed?: boolean;
  onModalOpen: () => void;
  selectModel: (modelId: string) => void;
};

const ModelsList: React.FC<Props> = ({
  className,
  defaultSelectedKeys,
  models,
  collapsed,
  onModalOpen,
  selectModel,
  title,
}) => {
  const t = useT();
  const onClick = (e: MenuInfo) => {
    selectModel(e.key);
  };

  return (
    <SchemaStyledMenu className={className}>
      {collapsed ? (
        <StyledIcon icon="unorderedList" />
      ) : (
        <Header>
          <SchemaStyledTitle>{title}</SchemaStyledTitle>
          <SchemaAction>
            <SchemaStyledMenuTitle>{t("Models")}</SchemaStyledMenuTitle>
            <SchemaAddButton onClick={onModalOpen} icon={<Icon icon="plus" />} type="text">
              {!collapsed && t("Add")}
            </SchemaAddButton>
          </SchemaAction>
        </Header>
      )}
      <MenuWrapper>
        <StyledMenu
          onClick={onClick}
          defaultSelectedKeys={defaultSelectedKeys}
          mode={collapsed ? "vertical" : "inline"}
          style={{
            color: collapsed ? "#C4C4C4" : undefined,
          }}
          items={models?.map(model => ({
            label: collapsed ? <Icon icon="dot" /> : model.name,
            key: model.id,
          }))}
        />
      </MenuWrapper>
    </SchemaStyledMenu>
  );
};

const Header = styled.div`
  padding: 22px 20px 4px 20px;
`;

const SchemaAction = styled.div<{ collapsed?: boolean }>`
  display: flex;
  justify-content: ${({ collapsed }) => (collapsed ? "space-around" : "space-between")};
  align-items: center;
`;

const SchemaAddButton = styled(Button)`
  color: #1890ff;
  padding: 4px;
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
  color: #00000073;
`;

const SchemaStyledTitle = styled.h2``;

const SchemaStyledMenu = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  height: 100%;
  border-right: 1px solid #f0f0f0;
`;

const MenuWrapper = styled.div`
  overflow: auto;
`;

const StyledIcon = styled(Icon)`
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 20px;
`;

const StyledMenu = styled(Menu)`
  .ant-menu-item {
    display: flex;
    justify-content: center;
  }
`;

export default ModelsList;
