import styled from "@emotion/styled";
import { useMemo, useCallback } from "react";
import ReactDragListView from "react-drag-listview";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import { SelectedSchemaType } from "@reearth-cms/components/molecules/Schema";
import { Model } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  className?: string;
  selectedKey?: string;
  models?: Model[];
  selectedSchemaType?: SelectedSchemaType;
  collapsed?: boolean;
  onModalOpen: () => void;
  onModelSelect: (modelId: string) => void;
  onUpdateModelsOrder: (modelIds: string[]) => void;
};

const ModelsList: React.FC<Props> = ({
  className,
  selectedKey,
  models,
  selectedSchemaType,
  collapsed,
  onModalOpen,
  onModelSelect,
  onUpdateModelsOrder,
}) => {
  const t = useT();

  const handleClick = (e: MenuInfo) => {
    onModelSelect(e.key);
  };

  const onDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || !models) return;
      const [removed] = models.splice(fromIndex, 1);
      models.splice(toIndex, 0, removed);
      const modelIds = models.map(model => model.id);
      onUpdateModelsOrder(modelIds);
    },
    [models, onUpdateModelsOrder],
  );

  const selectedKeys = useMemo(() => {
    return !selectedSchemaType
      ? [selectedKey ?? ""]
      : selectedSchemaType === "model" && selectedKey
        ? [selectedKey]
        : [];
  }, [selectedKey, selectedSchemaType]);

  const items = useMemo(() => {
    return models
      ?.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return 0;
      })
      .map(model => ({
        label: collapsed ? <Icon icon="dot" /> : model.name,
        key: model.id,
      }));
  }, [collapsed, models]);

  return (
    <SchemaStyledMenu className={className}>
      {collapsed ? (
        <StyledIcon icon="caretRight" />
      ) : (
        <Header>
          <SchemaAction>
            <SchemaStyledMenuTitle>{t("Models")}</SchemaStyledMenuTitle>
            <SchemaAddButton onClick={onModalOpen} icon={<Icon icon="plus" />} type="text">
              {!collapsed && t("Add")}
            </SchemaAddButton>
          </SchemaAction>
        </Header>
      )}
      <MenuWrapper>
        <ReactDragListView
          nodeSelector=".ant-menu-item"
          lineClassName="dragLine"
          onDragEnd={(fromIndex, toIndex) => onDragEnd(fromIndex, toIndex)}>
          <StyledMenu
            selectedKeys={selectedKeys}
            mode={collapsed ? "vertical" : "inline"}
            style={{
              color: collapsed ? "#C4C4C4" : undefined,
            }}
            items={items}
            onClick={handleClick}
          />
        </ReactDragListView>
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

const SchemaStyledMenu = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
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
