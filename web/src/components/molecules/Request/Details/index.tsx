import RequestMolecule from "@reearth-cms//components/molecules/Request/Details/Request";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";

export type Props = {
  me?: User;
  currentRequest?: Request;
  onRequestApprove: (requestId: string) => Promise<void>;
  onRequestDelete: (requestsId: string[]) => Promise<void>;
  onCommentCreate: (content: string) => Promise<void>;
  onBack: () => void;
};

const RequestDetailsMolecule: React.FC<Props> = ({
  me,
  currentRequest,
  onRequestApprove,
  onRequestDelete,
  onCommentCreate,
  onBack,
}) => {
  return currentRequest ? (
    <RequestMolecule
      me={me}
      currentRequest={currentRequest}
      onRequestApprove={onRequestApprove}
      onRequestDelete={onRequestDelete}
      onCommentCreate={onCommentCreate}
      onBack={onBack}
    />
  ) : null;
};
export default RequestDetailsMolecule;
