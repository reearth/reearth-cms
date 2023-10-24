import styled from "@emotion/styled";
import { useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { View } from "@reearth-cms/components/molecules/View/types";
import { useT } from "@reearth-cms/i18n";

import ViewsMenuItem from "./viewMenuItem";

export interface Props {
  views: View[];
  onViewModalOpen?: () => void;
  onViewUpdateModalOpen?: () => void;
  onViewRenameModalOpen?: (view: View) => void;
  onDelete: (viewId: string) => void;
  onViewDeletionClose: () => void;
}

const ViewsMenuMolecule: React.FC<Props> = ({
  views,
  onViewModalOpen,
  // onViewUpdateModalOpen,
  onViewRenameModalOpen,
  onDelete,
  onViewDeletionClose,
}) => {
  const t = useT();
  const [selectedKey, setSelectedKey] = useState<string>(
    views && views.length > 0 ? views[0].id : "",
  );

  const menuItems = views?.map(view => {
    return {
      label: (
        <ViewsMenuItem
          view={view}
          onViewRenameModalOpen={onViewRenameModalOpen}
          onDelete={onDelete}
          onViewDeletionClose={onViewDeletionClose}
        />
      ),
      key: view.id,
    };
  });

  const handleSelectView = (key: any) => {
    setSelectedKey(key);
  };

  return (
    <Wrapper>
      <StyledTabs
        defaultActiveKey="1"
        activeKey={selectedKey}
        tabPosition="top"
        items={menuItems}
        popupClassName="hide-icon-button"
        onTabClick={handleSelectView}
        moreIcon={<Button>All Views</Button>}
      />
      <NewViewButton type="text" onClick={onViewModalOpen}>
        {t("Save as new view")}
      </NewViewButton>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  padding: 0 24px;
  align-items: center;
`;

const StyledTabs = styled(Tabs)`
  flex: 1;
  height: 46px;

  .ant-tabs-nav-wrap {
    width: 0px;
  }
  .ant-tabs-nav {
    height: 46px;
  }
`;

const NewViewButton = styled(Button)`
  color: rgba(0, 0, 0, 0.25);
`;

export default ViewsMenuMolecule;
