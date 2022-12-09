import RequestDetailsMolecule from "@reearth-cms/components/molecules/Request/Details";

import useHooks from "./hooks";

const RequestDetails: React.FC = () => {
  const { currentRequest } = useHooks();

  return <RequestDetailsMolecule currentRequest={currentRequest} />;
};

export default RequestDetails;
