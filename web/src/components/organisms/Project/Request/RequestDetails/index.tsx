import RequestDetailsMolecule from "@reearth-cms/components/molecules/Request/Details";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/ContentDetails/hooks";

import useHooks from "./hooks";

const RequestDetails: React.FC = () => {
  const {
    me,
    currentRequest,
    handleRequestApprove,
    handleRequestDelete,
    handleCommentCreate,
    handleNavigateToRequestsList,
    handleNavigateToItemEditForm,
  } = useHooks();

  const { workspaceUserMembers, handleRequestUpdate } = useContentHooks();

  return (
    <RequestDetailsMolecule
      me={me}
      currentRequest={currentRequest}
      workspaceUserMembers={workspaceUserMembers}
      onRequestApprove={handleRequestApprove}
      onRequestUpdate={handleRequestUpdate}
      onRequestDelete={handleRequestDelete}
      onCommentCreate={handleCommentCreate}
      onBack={handleNavigateToRequestsList}
      onItemEdit={handleNavigateToItemEditForm}
    />
  );
};

export default RequestDetails;
