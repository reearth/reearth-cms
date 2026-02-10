import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";
import ReactDragListView from "react-drag-listview";

import Button from "@reearth-cms/components/atoms/Button";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { View, CurrentView } from "@reearth-cms/components/molecules/View/types";
import ViewsMenuItem from "@reearth-cms/components/molecules/View/viewMenuItem";
import { useT } from "@reearth-cms/i18n";

const { DragColumn } = ReactDragListView;

type Props = {
  views: View[];
  onViewRenameModalOpen: (view: View) => void;
  onDelete: (viewId: string) => Promise<void>;
  onUpdate: (viewId: string, name: string) => Promise<void>;
  currentView: CurrentView;
  onViewCreateModalOpen: () => void;
  onViewSelect: (key: string) => void;
  onUpdateViewsOrder: (viewIds: string[]) => Promise<void>;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
};

const ViewsMenuMolecule: React.FC<Props> = ({
  views,
  onViewRenameModalOpen,
  onViewCreateModalOpen,
  onUpdate,
  onDelete,
  currentView,
  onViewSelect,
  onUpdateViewsOrder,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
}) => {
  const t = useT();

  const onDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0) return;
      const [removed] = views.splice(fromIndex, 1);
      views.splice(toIndex, 0, removed);
      const viewIds = views.map(view => view.id);
      onUpdateViewsOrder(viewIds);
    },
    [onUpdateViewsOrder, views],
  );

  const menuItems = useMemo(
    () =>
      views
        .sort((a, b) => a.order - b.order)
        .map(view => ({
          label: (
            <ViewsMenuItem
              view={view}
              hasUpdateRight={hasUpdateRight}
              hasDeleteRight={hasDeleteRight}
              onViewRenameModalOpen={onViewRenameModalOpen}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ),
          key: view.id,
          data: view,
        })),
    [views, hasUpdateRight, hasDeleteRight, onViewRenameModalOpen, onDelete, onUpdate],
  );

  const tabBarExtraContent = useMemo(
    () => (
      <NewViewButton type="text" onClick={onViewCreateModalOpen} disabled={!hasCreateRight}>
        {t("Save as new view")}
      </NewViewButton>
    ),
    [onViewCreateModalOpen, hasCreateRight, t],
  );

  const moreIcon = useMemo(() => <MoreIcon>All Views</MoreIcon>, []);

  return (
    <Wrapper>
      <DragColumn
        nodeSelector={hasUpdateRight ? ".ant-tabs-tab" : undefined}
        lineClassName="dragLineColumn"
        onDragEnd={onDragEnd}>
        <StyledTabs
          tabBarExtraContent={tabBarExtraContent}
          activeKey={currentView.id}
          tabPlacement="top"
          items={menuItems}
          classNames={{ popup: { root: "hide-icon-button" } }}
          onChange={onViewSelect}
          moreIcon={moreIcon}
        />
      </DragColumn>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 0 24px;
`;

const StyledTabs = styled(Tabs)`
  height: 46px;

  .ant-tabs-nav-wrap {
    width: 0px;
    max-width: fit-content;
  }
  .ant-tabs-nav {
    height: 46px;
  }

  .ant-tabs-tab:not(:first-of-type) {
    padding-left: 8px;
  }

  .ant-tabs-tab + .ant-tabs-tab {
    margin-left: 8px;
  }
`;

const MoreIcon = styled.span`
  padding: 4px 15px;
  cursor: pointer;
`;

const NewViewButton = styled(Button)`
  color: rgba(0, 0, 0, 0.25);
  margin-left: 5px;
`;

export default ViewsMenuMolecule;
