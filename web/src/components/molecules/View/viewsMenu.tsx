import styled from "@emotion/styled";
import { useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";
import { View } from "@reearth-cms/components/molecules/View/types";

import ViewsMenuItem from "./viewMenuItem";

export interface Props {
  views?: View[];
  onViewModalOpen?: () => void;
  onViewUpdateModalOpen?: () => void;
  onViewRenameModalOpen?: (view: View) => void;
  onViewDeletionModalOpen?: (view: View) => void;
}

const ViewsMenuMolecule: React.FC<Props> = ({
  views,
  onViewModalOpen,
  // onViewUpdateModalOpen,
  onViewRenameModalOpen,
  onViewDeletionModalOpen,
}) => {
  const [selectedView, setSelectedView] = useState<string>(
    views && views.length > 0 ? views[0].id : "",
  );

  const menuItems = views?.map(view => {
    return {
      label: (
        <ViewsMenuItem
          view={view}
          onViewRenameModalOpen={onViewRenameModalOpen}
          onViewDeletionModalOpen={onViewDeletionModalOpen}
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
        overflowedIndicator={<Button>All Views</Button>}
        triggerSubMenuAction="click"
        selectedKeys={[selectedView]}
        items={menuItems}
        onClick={handleSelectView}
      />
      <NewViewButton type="text" onClick={onViewModalOpen}>
        Save as new view
      </NewViewButton>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: "flex";
  align-items: "center";
`;

const StyledMenu = styled(Menu)`
  flex: 1;
`;

const NewViewButton = styled(Button)`
  color: "rgba(0, 0, 0, 0.25)";
`;

export default ViewsMenuMolecule;
