import React from "react";

import { CurrentView, View } from "@reearth-cms/components/molecules/View/types";
import ViewFormModal from "@reearth-cms/components/molecules/View/ViewFormModal";
import ViewsMenuMolecule from "@reearth-cms/components/molecules/View/viewsMenu";

import useHooks from "./hooks";

type Props = {
  currentView: CurrentView;
  onViewChange: () => void;
  onViewSelect: (key: string) => void;
  views: View[];
};

const ViewsMenu: React.FC<Props> = ({ currentView, onViewChange, onViewSelect, views }) => {
  const {
    handleUpdateViewsOrder,
    handleViewCreate,
    handleViewCreateModalOpen,
    handleViewDelete,
    handleViewModalReset,
    handleViewRename,
    handleViewRenameModalOpen,
    handleViewUpdate,
    hasCreateRight,
    hasDeleteRight,
    hasUpdateRight,
    modalState,
    submitting,
    viewModalShown,
  } = useHooks({ currentView, onViewChange });

  return (
    <>
      <ViewsMenuMolecule
        currentView={currentView}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onDelete={handleViewDelete}
        onUpdate={handleViewUpdate}
        onUpdateViewsOrder={handleUpdateViewsOrder}
        onViewCreateModalOpen={handleViewCreateModalOpen}
        onViewRenameModalOpen={handleViewRenameModalOpen}
        onViewSelect={onViewSelect}
        views={views}
      />
      <ViewFormModal
        currentView={currentView}
        modalState={modalState}
        onClose={handleViewModalReset}
        onCreate={handleViewCreate}
        OnUpdate={handleViewRename}
        open={viewModalShown}
        submitting={submitting}
      />
    </>
  );
};

export default ViewsMenu;
