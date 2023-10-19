import styled from "@emotion/styled";
import { useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";
import { View } from "@reearth-cms/gql/graphql-client-api";
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
  const [selectedView, setSelectedView] = useState<string>(
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

  const handleSelectView: MenuProps["onClick"] = (e: any) => {
    setSelectedView(e.key);
  };

  return (
    <Wrapper>
      <StyledMenu
        mode="horizontal"
        expandIcon={<Icon />}
        overflowedIndicator={<AllViewsButton>{t("All Views")}</AllViewsButton>}
        triggerSubMenuAction="click"
        selectedKeys={[selectedView]}
        items={menuItems}
        onClick={handleSelectView}
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

const StyledMenu = styled(Menu)`
  flex: 1;
  height: 46px;

  .ant-menu-item {
    padding: 0px 32px 0px 0px !important;
    display: flex;
    align-items: center;
  }
  .ant-menu-item::after {
    right: 32px;
    left: 0px;
    position: absolute;
  }
  .ant-menu-overflow-item-rest {
    padding: 0px !important;
  }
  .ant-menu-overflow-item-rest::after {
    right: 0px;
    left: 0px;
    position: absolute;
  }
`;

const NewViewButton = styled(Button)`
  color: rgba(0, 0, 0, 0.25);
`;

const AllViewsButton = styled(Button)`
  padding: 5px 16px;
`;

export default ViewsMenuMolecule;
