import RequestDetailsMolecule from "@reearth-cms/components/molecules/Request/Details";

import useHooks from "./hooks";

const RequestDetails: React.FC = () => {
  const {
    currentRequest,
    handleRequestApprove,
    handleRequestDelete,
    handleCommentCreate,
    handleNavigateToRequestsList,
  } = useHooks();

  return (
    <RequestDetailsMolecule
      currentRequest={currentRequest}
      onRequestApprove={handleRequestApprove}
      onRequestDelete={handleRequestDelete}
      onCommentCreate={handleCommentCreate}
      onBack={handleNavigateToRequestsList}
    />
  );
};

export default RequestDetails;
