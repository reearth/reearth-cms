import RequestMolecule from "@reearth-cms//components/molecules/Request/Details/Request";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";

export type Props = {
  me?: User;
  currentRequest?: Request;
  workspaceUserMembers: Member[];
  onRequestApprove: (requestId: string) => Promise<void>;
  onRequestUpdate: (data: RequestUpdatePayload) => Promise<void>;
  onRequestDelete: (requestsId: string[]) => Promise<void>;
  onCommentCreate: (content: string) => Promise<void>;
  onBack: () => void;
};

const RequestDetailsMolecule: React.FC<Props> = ({
  me,
  currentRequest,
  workspaceUserMembers,
  onRequestApprove,
  onRequestUpdate,
  onRequestDelete,
  onCommentCreate,
  onBack,
}) => {
  return currentRequest ? (
    <RequestMolecule
      me={me}
      currentRequest={currentRequest}
      workspaceUserMembers={workspaceUserMembers}
      onRequestApprove={onRequestApprove}
      onRequestUpdate={onRequestUpdate}
      onRequestDelete={onRequestDelete}
      onCommentCreate={onCommentCreate}
      onBack={onBack}
    />
  ) : null;
};
export default RequestDetailsMolecule;
