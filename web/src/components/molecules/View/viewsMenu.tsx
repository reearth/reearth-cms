import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { View } from "@reearth-cms/components/molecules/View/types";
import ViewsMenuItem from "@reearth-cms/components/molecules/View/viewMenuItem";
import { useT } from "@reearth-cms/i18n";

export interface Props {
  views: View[];
  onViewRenameModalOpen?: (view: View) => void;
  onDelete: (viewId: string) => void;
  onUpdate: (viewId: string, name: string) => Promise<void>;
  onViewDeletionClose: () => void;
  selectedView?: View;
  setSelectedView: (view?: View) => void;
  onViewCreateModalOpen: () => void;
}

const ViewsMenuMolecule: React.FC<Props> = ({
  views,
  onViewRenameModalOpen,
  onViewCreateModalOpen,
  onUpdate,
  onDelete,
  onViewDeletionClose,
  selectedView,
  setSelectedView,
}) => {
  const t = useT();

  const menuItems = views?.map(view => {
    return {
      label: (
        <ViewsMenuItem
          view={view}
          onViewRenameModalOpen={onViewRenameModalOpen}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onViewDeletionClose={onViewDeletionClose}
        />
      ),
      key: view.id,
      data: view,
    };
  });

  const handleSelectView = useCallback(
    (key: string) => {
      views.forEach(view => {
        if (view.id === key) {
          setSelectedView(view);
        }
      });
    },
    [setSelectedView, views],
  );

  return (
    <Wrapper>
      <StyledTabs
        tabBarExtraContent={
          <NewViewButton type="text" onClick={onViewCreateModalOpen}>
            {t("Save as new view")}
          </NewViewButton>
        }
        defaultActiveKey="1"
        activeKey={selectedView?.id}
        tabPosition="top"
        items={menuItems}
        popupClassName="hide-icon-button"
        onChange={handleSelectView}
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
`;

const NewViewButton = styled(Button)`
  color: rgba(0, 0, 0, 0.25);
  margin-left: 5px;
`;

export default ViewsMenuMolecule;
