import Loading from "@reearth-cms/components/atoms/Loading";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import RequestMolecule from "@reearth-cms/components/molecules/Request/Details/Request";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";

export type Props = {
  me?: User;
  isCloseActionEnabled: boolean;
  isApproveActionEnabled: boolean;
  currentRequest?: Request;
  workspaceUserMembers: UserMember[];
  onRequestApprove: (requestId: string) => Promise<void>;
  onRequestUpdate: (data: RequestUpdatePayload) => Promise<void>;
  onRequestDelete: (requestsId: string[]) => Promise<void>;
  onCommentCreate: (content: string) => Promise<void>;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
};

const RequestDetailsMolecule: React.FC<Props> = ({
  me,
  isCloseActionEnabled,
  isApproveActionEnabled,
  currentRequest,
  workspaceUserMembers,
  onRequestApprove,
  onRequestUpdate,
  onRequestDelete,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
  onBack,
  loading,
  onGetAsset,
  onGroupGet,
}) => {
  return loading ? (
    <Loading spinnerSize="large" minHeight="100vh" />
  ) : currentRequest ? (
    <RequestMolecule
      me={me}
      isCloseActionEnabled={isCloseActionEnabled}
      isApproveActionEnabled={isApproveActionEnabled}
      currentRequest={currentRequest}
      workspaceUserMembers={workspaceUserMembers}
      onRequestApprove={onRequestApprove}
      onRequestUpdate={onRequestUpdate}
      onRequestDelete={onRequestDelete}
      onCommentCreate={onCommentCreate}
      onCommentUpdate={onCommentUpdate}
      onCommentDelete={onCommentDelete}
      onBack={onBack}
      onGetAsset={onGetAsset}
      onGroupGet={onGroupGet}
    />
  ) : (
    <NotFound />
  );
};
export default RequestDetailsMolecule;
