import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";
import ReactDragListView from "react-drag-listview";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken, CustomColor } from "@reearth-cms/utils/style";

type Props = {
  selectedKey?: string;
  groups?: Group[];
  collapsed?: boolean;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  onModalOpen: () => void;
  onGroupSelect?: (groupId: string) => void;
  onUpdateGroupsOrder: (groupIds: string[]) => Promise<void>;
};

const GroupsList: React.FC<Props> = ({
  selectedKey,
  groups,
  collapsed,
  hasCreateRight,
  hasUpdateRight,
  onModalOpen,
  onGroupSelect,
  onUpdateGroupsOrder,
}) => {
  const t = useT();

  const selectedKeys = useMemo(() => {
    return selectedKey ? [selectedKey] : [];
  }, [selectedKey]);

  const scrollToSelected = useCallback(
    (node: HTMLElement | null) => node?.scrollIntoView({ block: "nearest" }),
    [],
  );

  const items = useMemo(
    () =>
      groups
        ?.sort((a, b) => a.order - b.order)
        .map(group => ({
          label: (
            <div ref={group.id === selectedKey ? scrollToSelected : undefined}>
              {collapsed ? (
                <Tooltip placement="right" title={group.name}>
                  <span>
                    <Icon icon="dot" />
                  </span>
                </Tooltip>
              ) : (
                group.name
              )}
            </div>
          ),
          key: group.id,
        })),
    [collapsed, groups, scrollToSelected, selectedKey],
  );

  const handleClick = useCallback(
    (e: MenuInfo) => {
      onGroupSelect?.(e.key);
    },
    [onGroupSelect],
  );

  const onDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || !groups) return;
      const [removed] = groups.splice(fromIndex, 1);
      groups.splice(toIndex, 0, removed);
      const groupIds = groups.map(group => group.id);
      onUpdateGroupsOrder(groupIds);
    },
    [groups, onUpdateGroupsOrder],
  );

  return (
    <SchemaStyledMenu>
      {collapsed ? (
        <StyledIcon icon="caretRight" />
      ) : (
        <Header>
          <SchemaAction>
            <SchemaStyledMenuTitle>{t("GROUPS")}</SchemaStyledMenuTitle>
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
  padding: 22px ${AntdToken.SPACING.MD}px ${AntdToken.SPACING.XXS}px ${AntdToken.SPACING.MD}px;
`;

const SchemaAction = styled.div<{ collapsed?: boolean }>`
  display: flex;
  justify-content: ${({ collapsed }) => (collapsed ? "space-around" : "space-between")};
  align-items: center;
`;

const SchemaAddButton = styled(Button)`
  padding: ${AntdToken.SPACING.XXS}px;
`;

const SchemaStyledMenuTitle = styled.h1`
  margin: 0;
  font-weight: ${AntdToken.FONT_WEIGHT.NORMAL};
  font-size: ${AntdToken.FONT.SIZE}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
`;

const SchemaStyledMenu = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${AntdColor.NEUTRAL.BG_WHITE};
`;

const MenuWrapper = styled.div`
  overflow: auto;
`;

const StyledIcon = styled(Icon)`
  border-bottom: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  padding: ${AntdToken.SPACING.SM}px 0;
  justify-content: center;
`;

const StyledMenu = styled(Menu)<{ collapsed?: boolean }>`
  color: ${({ collapsed }) => (collapsed ? CustomColor.TEXT_DISABLED : undefined)};

  .ant-menu-item {
    display: flex;
    justify-content: center;
  }
`;

export default GroupsList;
