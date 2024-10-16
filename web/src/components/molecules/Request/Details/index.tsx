import Loading from "@reearth-cms/components/atoms/Loading";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import RequestMolecule from "@reearth-cms/components/molecules/Request/Details/Request";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";

type Props = {
  me?: User;
  hasCommentCreateRight: boolean;
  hasCommentUpdateRight: boolean | null;
  hasCommentDeleteRight: boolean | null;
  isCloseActionEnabled: boolean;
  isReopenActionEnabled: boolean;
  isApproveActionEnabled: boolean;
  isAssignActionEnabled: boolean;
  currentRequest?: Request;
  workspaceUserMembers: UserMember[];
  loading: boolean;
  deleteLoading: boolean;
  approveLoading: boolean;
  updateLoading: boolean;
  onRequestApprove: (requestId: string) => Promise<void>;
  onRequestUpdate: (data: RequestUpdatePayload) => Promise<void>;
  onRequestDelete: (requestsId: string[]) => Promise<void>;
  onCommentCreate: (content: string) => Promise<void>;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  onBack: () => void;
  onNavigateToItemEdit: (modelId: string, itemId: string) => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
};

const RequestDetailsMolecule: React.FC<Props> = ({
  me,
  hasCommentCreateRight,
  hasCommentUpdateRight,
  hasCommentDeleteRight,
  isCloseActionEnabled,
  isReopenActionEnabled,
  isApproveActionEnabled,
  isAssignActionEnabled,
  currentRequest,
  workspaceUserMembers,
  loading,
  deleteLoading,
  approveLoading,
  updateLoading,
  onRequestApprove,
  onRequestUpdate,
  onRequestDelete,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
  onBack,
  onNavigateToItemEdit,
  onGetAsset,
  onGroupGet,
}) => {
  return loading ? (
    <Loading spinnerSize="large" minHeight="100vh" />
  ) : currentRequest ? (
    <RequestMolecule
      me={me}
      hasCommentCreateRight={hasCommentCreateRight}
      hasCommentUpdateRight={hasCommentUpdateRight}
      hasCommentDeleteRight={hasCommentDeleteRight}
      isCloseActionEnabled={isCloseActionEnabled}
      isReopenActionEnabled={isReopenActionEnabled}
      isApproveActionEnabled={isApproveActionEnabled}
      isAssignActionEnabled={isAssignActionEnabled}
      currentRequest={currentRequest}
      workspaceUserMembers={workspaceUserMembers}
      deleteLoading={deleteLoading}
      approveLoading={approveLoading}
      updateLoading={updateLoading}
      onRequestApprove={onRequestApprove}
      onRequestUpdate={onRequestUpdate}
      onRequestDelete={onRequestDelete}
      onCommentCreate={onCommentCreate}
      onCommentUpdate={onCommentUpdate}
      onCommentDelete={onCommentDelete}
      onBack={onBack}
      onNavigateToItemEdit={onNavigateToItemEdit}
      onGetAsset={onGetAsset}
      onGroupGet={onGroupGet}
    />
  ) : (
    <NotFound />
  );
};
export default RequestDetailsMolecule;
