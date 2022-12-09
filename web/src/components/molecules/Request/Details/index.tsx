import RequestMolecule from "@reearth-cms//components/molecules/Request/Details/Request";
import RequestSidebarWrapper from "@reearth-cms//components/molecules/Request/Details/SidebarWrapper";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import { Request } from "@reearth-cms/components/molecules/Request/types";

export type Props = {
  currentRequest?: Request;
};

const RequestDetailsMolecule: React.FC<Props> = ({ currentRequest }) => {
  return (
    <ComplexInnerContents
      center={<RequestMolecule />}
      right={<RequestSidebarWrapper currentRequest={currentRequest} />}
    />
  );
};

export default RequestDetailsMolecule;
