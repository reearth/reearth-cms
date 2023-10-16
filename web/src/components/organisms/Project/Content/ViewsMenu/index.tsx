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
    selectedView,
    viewModalShown,
    handleViewModalReset,
    handleViewCreate,
    handleViewUpdate,
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
        onDelete={handleViewDelete}
        onViewDeletionClose={handleViewDeletionModalClose}
      />
      <ViewFormMobal
        view={selectedView}
        open={viewModalShown}
        onClose={handleViewModalReset}
        onCreate={handleViewCreate}
        OnUpdate={handleViewUpdate}
      />
    </>
  );
};

export default ViewsMenu;
