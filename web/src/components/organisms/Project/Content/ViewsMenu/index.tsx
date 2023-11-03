import React from "react";
import { useParams } from "react-router-dom";

import ViewFormMobal from "@reearth-cms/components/molecules/View/ViewFormModal";
import ViewsMenuMolecule from "@reearth-cms/components/molecules/View/viewsMenu";
import { View } from "@reearth-cms/gql/graphql-client-api";

import { CurrentViewType } from "../ContentList/hooks";

import useHooks from "./hooks";

export type Props = {
  currentView: CurrentViewType;
  setCurrentView: (view: CurrentViewType) => void;
};

const ViewsMenu: React.FC<Props> = ({ currentView, setCurrentView }) => {
  const { modelId } = useParams();

  const {
    views,
    handleViewModalOpen,
    handleViewRenameModalOpen,
    selectedView,
    viewModalShown,
    submitting,
    handleViewModalReset,
    handleViewCreate,
    handleViewRename,
    handleViewUpdate,
    handleViewDelete,
    handleViewDeletionModalClose,
  } = useHooks({ modelId, currentView });

  return (
    <>
      <ViewsMenuMolecule
        views={views as View[]}
        onViewModalOpen={handleViewModalOpen}
        onViewRenameModalOpen={handleViewRenameModalOpen}
        onDelete={handleViewDelete}
        onUpdate={handleViewUpdate}
        setCurrentView={setCurrentView}
        onViewDeletionClose={handleViewDeletionModalClose}
      />
      <ViewFormMobal
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
