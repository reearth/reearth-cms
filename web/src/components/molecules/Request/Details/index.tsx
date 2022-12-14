import RequestMolecule from "@reearth-cms//components/molecules/Request/Details/Request";
import { Request } from "@reearth-cms/components/molecules/Request/types";

export type Props = {
  currentRequest?: Request;
  onRequestApprove: (requestId: string) => Promise<void>;
  onRequestDelete: (requestsId: string[]) => Promise<void>;
  onCommentCreate: (content: string) => Promise<void>;
};

const RequestDetailsMolecule: React.FC<Props> = ({
  currentRequest,
  onRequestApprove,
  onRequestDelete,
  onCommentCreate,
}) => {
  return currentRequest ? (
    <RequestMolecule
      onRequestApprove={onRequestApprove}
      onRequestDelete={onRequestDelete}
      currentRequest={currentRequest}
      onCommentCreate={onCommentCreate}
    />
  ) : null;
};
export default RequestDetailsMolecule;
