import styled from "@emotion/styled";
import { useCallback } from "react";
import ReactDragListView from "react-drag-listview";

import Button from "@reearth-cms/components/atoms/Button";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { CurrentView, View } from "@reearth-cms/components/molecules/View/types";
import ViewsMenuItem from "@reearth-cms/components/molecules/View/viewMenuItem";
import { useT } from "@reearth-cms/i18n";

const { DragColumn } = ReactDragListView;

type Props = {
  currentView: CurrentView;
  hasCreateRight: boolean;
  hasDeleteRight: boolean;
  hasUpdateRight: boolean;
  onDelete: (viewId: string) => Promise<void>;
  onUpdate: (viewId: string, name: string) => Promise<void>;
  onUpdateViewsOrder: (viewIds: string[]) => Promise<void>;
  onViewCreateModalOpen: () => void;
  onViewRenameModalOpen: (view: View) => void;
  onViewSelect: (key: string) => void;
  views: View[];
};

const ViewsMenuMolecule: React.FC<Props> = ({
  currentView,
  hasCreateRight,
  hasDeleteRight,
  hasUpdateRight,
  onDelete,
  onUpdate,
  onUpdateViewsOrder,
  onViewCreateModalOpen,
  onViewRenameModalOpen,
  onViewSelect,
  views,
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

  const menuItems = views
    .sort((a, b) => a.order - b.order)
    .map(view => {
      return {
        data: view,
        key: view.id,
        label: (
          <ViewsMenuItem
            hasDeleteRight={hasDeleteRight}
            hasUpdateRight={hasUpdateRight}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onViewRenameModalOpen={onViewRenameModalOpen}
            view={view}
          />
        ),
      };
    });

  return (
    <Wrapper>
      <DragColumn
        lineClassName="dragLineColumn"
        nodeSelector={hasUpdateRight ? ".ant-tabs-tab" : undefined}
        onDragEnd={(fromIndex, toIndex) => onDragEnd(fromIndex, toIndex)}>
        <StyledTabs
          activeKey={currentView.id}
          items={menuItems}
          moreIcon={<Button>All Views</Button>}
          onChange={onViewSelect}
          popupClassName="hide-icon-button"
          tabBarExtraContent={
            <NewViewButton disabled={!hasCreateRight} onClick={onViewCreateModalOpen} type="text">
              {t("Save as new view")}
            </NewViewButton>
          }
          tabPosition="top"
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

  .ant-tabs-tab:not(:first-child) {
    padding-left: 8px;
  }

  .ant-tabs-tab + .ant-tabs-tab {
    margin-left: 8px;
  }
`;

const NewViewButton = styled(Button)`
  color: rgba(0, 0, 0, 0.25);
  margin-left: 5px;
`;

export default ViewsMenuMolecule;
