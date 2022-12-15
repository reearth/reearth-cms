import RequestMolecule from "@reearth-cms//components/molecules/Request/Details/Request";
import { Request } from "@reearth-cms/components/molecules/Request/types";

export type Props = {
  currentRequest?: Request;
  onRequestApprove: (requestId: string) => Promise<void>;
  onRequestDelete: (requestsId: string[]) => Promise<void>;
  onCommentCreate: (content: string) => Promise<void>;
  onBack: () => void;
};

const RequestDetailsMolecule: React.FC<Props> = ({
  currentRequest,
  onRequestApprove,
  onRequestDelete,
  onCommentCreate,
  onBack,
}) => {
  return currentRequest ? (
    <RequestMolecule
      currentRequest={currentRequest}
      onRequestApprove={onRequestApprove}
      onRequestDelete={onRequestDelete}
      onCommentCreate={onCommentCreate}
      onBack={onBack}
    />
  ) : null;
};
export default RequestDetailsMolecule;
