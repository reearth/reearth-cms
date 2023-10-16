import { useParams } from "react-router-dom";

import ViewDeletionModal from "@reearth-cms/components/molecules/View/ViewDeletionModal";
import ViewFormMobal from "@reearth-cms/components/molecules/View/ViewFormModal";
import ViewsMenuMolecule from "@reearth-cms/components/molecules/View/viewsMenu";

import useHooks from "./hooks";

const ViewsMenu: React.FC = () => {
  const { modelId } = useParams();

  const {
    views,
    handleViewModalOpen,
    // handleViewUpdateModalOpen,
    handleViewRenameModalOpen,
    handleViewDeletionModalOpen,
    selectedView,
    viewModalShown,
    handleViewModalReset,
    handleViewCreate,
    handleViewUpdate,
    viewDeletionModalShown,
    handleViewDelete,
    handleViewDeletionModalClose,
  } = useHooks({ modelId });

  return (
    <>
      <ViewsMenuMolecule
        views={views}
        onViewModalOpen={handleViewModalOpen}
        // onViewUpdateModalOpen={handleViewUpdateModalOpen}
        onViewRenameModalOpen={handleViewRenameModalOpen}
        onViewDeletionModalOpen={handleViewDeletionModalOpen}
      />
      <ViewFormMobal
        view={selectedView}
        open={viewModalShown}
        onClose={handleViewModalReset}
        onCreate={handleViewCreate}
        OnUpdate={handleViewUpdate}
      />
      <ViewDeletionModal
        view={selectedView}
        open={viewDeletionModalShown}
        onDelete={handleViewDelete}
        onClose={handleViewDeletionModalClose}
      />
    </>
  );
};

export default ViewsMenu;
