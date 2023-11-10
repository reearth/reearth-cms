import React, { Dispatch, SetStateAction } from "react";
import { useParams } from "react-router-dom";

import ViewFormMobal from "@reearth-cms/components/molecules/View/ViewFormModal";
import ViewsMenuMolecule from "@reearth-cms/components/molecules/View/viewsMenu";
import { View } from "@reearth-cms/gql/graphql-client-api";

import { CurrentViewType } from "../ContentList/hooks";

import useHooks from "./hooks";

export type Props = {
  currentView: CurrentViewType;
  setCurrentView: Dispatch<SetStateAction<CurrentViewType>>;
};

const ViewsMenu: React.FC<Props> = ({ currentView, setCurrentView }) => {
  const { modelId } = useParams();

  const {
    views,
    modalState,
    handleViewRenameModalOpen,
    handleViewCreateModalOpen,
    selectedView,
    setSelectedView,
    viewModalShown,
    submitting,
    handleViewModalReset,
    handleViewCreate,
    handleViewRename,
    handleViewUpdate,
    handleViewDelete,
    handleViewDeletionModalClose,
  } = useHooks({ modelId, currentView, setCurrentView });

  return (
    <>
      <ViewsMenuMolecule
        views={views as View[]}
        onViewRenameModalOpen={handleViewRenameModalOpen}
        onViewCreateModalOpen={handleViewCreateModalOpen}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        onDelete={handleViewDelete}
        onUpdate={handleViewUpdate}
        onViewDeletionClose={handleViewDeletionModalClose}
      />
      <ViewFormMobal
        modalState={modalState}
        view={selectedView}
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
