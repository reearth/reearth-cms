import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { View, CurrentView } from "@reearth-cms/components/molecules/View/types";
import ViewsMenuItem from "@reearth-cms/components/molecules/View/viewMenuItem";
import { useT } from "@reearth-cms/i18n";

interface Props {
  views: View[];
  onViewRenameModalOpen: (view: View) => void;
  onDelete: (viewId: string) => void;
  onUpdate: (viewId: string, name: string) => Promise<void>;
  currentView: CurrentView;
  onViewCreateModalOpen: () => void;
  onViewSelect: (key: string) => void;
}

const ViewsMenuMolecule: React.FC<Props> = ({
  views,
  onViewRenameModalOpen,
  onViewCreateModalOpen,
  onUpdate,
  onDelete,
  currentView,
  onViewSelect,
}) => {
  const t = useT();

  const menuItems = views.map(view => {
    return {
      label: (
        <ViewsMenuItem
          view={view}
          onViewRenameModalOpen={onViewRenameModalOpen}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ),
      key: view.id,
      data: view,
    };
  });

  return (
    <Wrapper>
      <StyledTabs
        tabBarExtraContent={
          <NewViewButton type="text" onClick={onViewCreateModalOpen}>
            {t("Save as new view")}
          </NewViewButton>
        }
        activeKey={currentView.id}
        tabPosition="top"
        items={menuItems}
        popupClassName="hide-icon-button"
        onChange={onViewSelect}
        moreIcon={<Button>All Views</Button>}
      />
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
