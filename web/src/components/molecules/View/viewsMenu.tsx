import styled from "@emotion/styled";
import { useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { CurrentViewType } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import { filterConvert } from "@reearth-cms/components/organisms/Project/Content/ContentList/utils";
import {
  FieldSelector,
  ItemSortInput,
  View,
  AndCondition,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

import ViewsMenuItem from "./viewMenuItem";

export interface Props {
  views: View[];
  onViewModalOpen?: () => void;
  onViewRenameModalOpen?: (view: View) => void;
  onDelete: (viewId: string) => void;
  onUpdate: (viewId: string, name: string) => Promise<void>;
  onViewDeletionClose: () => void;
  setCurrentView: (view: CurrentViewType) => void;
}

const ViewsMenuMolecule: React.FC<Props> = ({
  views,
  onViewModalOpen,
  onViewRenameModalOpen,
  onUpdate,
  onDelete,
  onViewDeletionClose,
  setCurrentView,
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
          onUpdate={onUpdate}
          onViewDeletionClose={onViewDeletionClose}
        />
      ),
      key: view.id,
      data: view,
    };
  });

  const handleSelectView = (key: string) => {
    setSelectedKey(key);
    views.forEach(view => {
      if (view.id === key)
        setCurrentView({
          sort: view.sort as ItemSortInput,
          columns: view.columns as FieldSelector[],
          filter: filterConvert(view.filter as AndCondition),
        });
    });
  };

  return (
    <Wrapper>
      <StyledTabs
        tabBarExtraContent={
          <NewViewButton type="text" onClick={onViewModalOpen}>
            {t("Save as new view")}
          </NewViewButton>
        }
        defaultActiveKey="1"
        activeKey={selectedKey}
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
