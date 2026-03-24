import React from "react";

import { View, CurrentView } from "@reearth-cms/components/molecules/View/types";
import ViewFormModal from "@reearth-cms/components/molecules/View/ViewFormModal";
import ViewsMenuMolecule from "@reearth-cms/components/molecules/View/viewsMenu";

import useHooks from "./hooks";

type Props = {
  views: View[];
  currentView: CurrentView;
  onViewSelect: (key: string) => void;
  onViewChange: () => void;
};

const ViewsMenu: React.FC<Props> = ({ views, currentView, onViewSelect, onViewChange }) => {
  const {
    modalState,
    viewModalShown,
    submitting,
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
    handleViewRenameModalOpen,
    handleViewCreateModalOpen,
    handleViewModalReset,
    handleViewCreate,
    handleViewUpdate,
    handleViewRename,
    handleViewDelete,
    handleUpdateViewsOrder,
  } = useHooks({ currentView, onViewChange });

  return (
    <>
      <ViewsMenuMolecule
        views={views}
        onViewRenameModalOpen={handleViewRenameModalOpen}
        onViewCreateModalOpen={handleViewCreateModalOpen}
        currentView={currentView}
        onDelete={handleViewDelete}
        onUpdate={handleViewUpdate}
        onViewSelect={onViewSelect}
        onUpdateViewsOrder={handleUpdateViewsOrder}
        hasCreateRight={hasCreateRight}
        hasUpdateRight={hasUpdateRight}
        hasDeleteRight={hasDeleteRight}
      />
      <ViewFormModal
        modalState={modalState}
        currentView={currentView}
        open={viewModalShown}
        submitting={submitting}
        onClose={handleViewModalReset}
        onCreate={handleViewCreate}
        OnUpdate={handleViewRename}
      />
    </>
  );
};

export default ViewsMenu;
