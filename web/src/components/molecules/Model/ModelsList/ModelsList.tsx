import styled from "@emotion/styled";
import { useMemo, useCallback } from "react";
import ReactDragListView from "react-drag-listview";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  selectedKey?: string;
  models?: Model[];
  collapsed: boolean;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  onModalOpen: () => void;
  onModelSelect: (modelId: string) => void;
  onUpdateModelsOrder: (modelIds: string[]) => Promise<void>;
};

const ModelsList: React.FC<Props> = ({
  selectedKey,
  models,
  collapsed,
  hasCreateRight,
  hasUpdateRight,
  onModalOpen,
  onModelSelect,
  onUpdateModelsOrder,
}) => {
  const t = useT();

  const handleClick = useCallback(
    (e: MenuInfo) => {
      onModelSelect(e.key);
    },
    [onModelSelect],
  );

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
    return selectedKey ? [selectedKey] : [];
  }, [selectedKey]);

  const scrollToSelected = useCallback(
    (node: HTMLElement | null) => node?.scrollIntoView({ block: "nearest" }),
    [],
  );

  const items = useMemo(
    () =>
      models
        ?.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return 0;
        })
        .map(model => ({
          label: (
            <div ref={model.id === selectedKey ? scrollToSelected : undefined}>
              {collapsed ? (
                <Tooltip placement="right" title={model.name}>
                  <span>
                    <Icon icon="dot" />
                  </span>
                </Tooltip>
              ) : (
                model.name
              )}
            </div>
          ),
          key: model.id,
        })),
    [collapsed, models, scrollToSelected, selectedKey],
  );

  return (
    <SchemaStyledMenu>
      {collapsed ? (
        <StyledIcon icon="caretRight" />
      ) : (
        <Header>
          <SchemaAction>
            <SchemaStyledMenuTitle>{t("MODELS")}</SchemaStyledMenuTitle>
            <SchemaAddButton
              onClick={onModalOpen}
              icon={<Icon icon="plus" />}
              type="link"
              disabled={!hasCreateRight}>
              {!collapsed && t("Add")}
            </SchemaAddButton>
          </SchemaAction>
        </Header>
      )}
      <MenuWrapper>
        <ReactDragListView
          nodeSelector={hasUpdateRight ? ".ant-menu-item" : undefined}
          lineClassName="dragLine"
          onDragEnd={(fromIndex, toIndex) => onDragEnd(fromIndex, toIndex)}>
          <StyledMenu
            selectedKeys={selectedKeys}
            mode={collapsed ? "vertical" : "inline"}
            collapsed={collapsed}
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
  padding: 4px;
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
`;

const MenuWrapper = styled.div`
  overflow: auto;
`;

const StyledIcon = styled(Icon)`
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 0;
  justify-content: center;
`;

const StyledMenu = styled(Menu)<{ collapsed?: boolean }>`
  color: ${({ collapsed }) => (collapsed ? "#C4C4C4" : undefined)};

  .ant-menu-item {
    display: flex;
    justify-content: center;
  }
`;

export default ModelsList;
