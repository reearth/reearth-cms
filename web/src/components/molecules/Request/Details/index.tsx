import Loading from "@reearth-cms/components/atoms/Loading";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import RequestMolecule from "@reearth-cms/components/molecules/Request/Details/Request";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";

type Props = {
  approveLoading: boolean;
  currentRequest?: Request;
  deleteLoading: boolean;
  hasCommentCreateRight: boolean;
  hasCommentDeleteRight: boolean | null;
  hasCommentUpdateRight: boolean | null;
  isApproveActionEnabled: boolean;
  isAssignActionEnabled: boolean;
  isCloseActionEnabled: boolean;
  isReopenActionEnabled: boolean;
  loading: boolean;
  me?: User;
  onBack: () => void;
  onCommentCreate: (content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  onNavigateToItemEdit: (modelId: string, itemId: string) => void;
  onRequestApprove: (requestId: string) => Promise<void>;
  onRequestDelete: (requestsId: string[]) => Promise<void>;
  onRequestUpdate: (data: RequestUpdatePayload) => Promise<void>;
  updateLoading: boolean;
  workspaceUserMembers: UserMember[];
};

const RequestDetailsMolecule: React.FC<Props> = ({
  approveLoading,
  currentRequest,
  deleteLoading,
  hasCommentCreateRight,
  hasCommentDeleteRight,
  hasCommentUpdateRight,
  isApproveActionEnabled,
  isAssignActionEnabled,
  isCloseActionEnabled,
  isReopenActionEnabled,
  loading,
  me,
  onBack,
  onCommentCreate,
  onCommentDelete,
  onCommentUpdate,
  onGetAsset,
  onGroupGet,
  onNavigateToItemEdit,
  onRequestApprove,
  onRequestDelete,
  onRequestUpdate,
  updateLoading,
  workspaceUserMembers,
}) => {
  return loading ? (
    <Loading minHeight="100vh" spinnerSize="large" />
  ) : currentRequest ? (
    <RequestMolecule
      approveLoading={approveLoading}
      currentRequest={currentRequest}
      deleteLoading={deleteLoading}
      hasCommentCreateRight={hasCommentCreateRight}
      hasCommentDeleteRight={hasCommentDeleteRight}
      hasCommentUpdateRight={hasCommentUpdateRight}
      isApproveActionEnabled={isApproveActionEnabled}
      isAssignActionEnabled={isAssignActionEnabled}
      isCloseActionEnabled={isCloseActionEnabled}
      isReopenActionEnabled={isReopenActionEnabled}
      me={me}
      onBack={onBack}
      onCommentCreate={onCommentCreate}
      onCommentDelete={onCommentDelete}
      onCommentUpdate={onCommentUpdate}
      onGetAsset={onGetAsset}
      onGroupGet={onGroupGet}
      onNavigateToItemEdit={onNavigateToItemEdit}
      onRequestApprove={onRequestApprove}
      onRequestDelete={onRequestDelete}
      onRequestUpdate={onRequestUpdate}
      updateLoading={updateLoading}
      workspaceUserMembers={workspaceUserMembers}
    />
  ) : (
    <NotFound />
  );
};
export default RequestDetailsMolecule;
