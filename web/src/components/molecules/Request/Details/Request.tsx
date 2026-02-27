import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import RequestThread from "@reearth-cms/components/molecules/Request/Details/Thread";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

import RequestSidebarWrapper from "./SidebarWrapper";

type Props = {
  approveLoading: boolean;
  currentRequest: Request;
  deleteLoading: boolean;
  hasCommentCreateRight: boolean;
  hasCommentDeleteRight: boolean | null;
  hasCommentUpdateRight: boolean | null;
  isApproveActionEnabled: boolean;
  isAssignActionEnabled: boolean;
  isCloseActionEnabled: boolean;
  isReopenActionEnabled: boolean;
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

const RequestMolecule: React.FC<Props> = ({
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
  const t = useT();

  return (
    <Content>
      <PageHeader
        extra={
          <>
            <Button
              disabled={!isCloseActionEnabled}
              loading={deleteLoading}
              onClick={() => onRequestDelete([currentRequest.id])}>
              {t("Close")}
            </Button>
            <Button
              disabled={!isReopenActionEnabled}
              hidden={currentRequest.state !== "CLOSED"}
              loading={updateLoading}
              onClick={() =>
                onRequestUpdate({
                  description: currentRequest?.description,
                  requestId: currentRequest.id,
                  reviewersId: currentRequest.reviewers.map(reviewer => reviewer.id),
                  state: "WAITING",
                  title: currentRequest?.title,
                })
              }>
              {t("Reopen")}
            </Button>
            <Button
              disabled={!isApproveActionEnabled}
              loading={approveLoading}
              onClick={() => onRequestApprove(currentRequest.id)}
              type="primary">
              {t("Approve")}
            </Button>
          </>
        }
        onBack={onBack}
        style={{ backgroundColor: "#fff" }}
        title={`${t("Request")} / ${currentRequest.title}`}
      />
      <BodyWrapper>
        <ThreadWrapper>
          <RequestThread
            currentRequest={currentRequest}
            hasCommentCreateRight={hasCommentCreateRight}
            hasCommentDeleteRight={hasCommentDeleteRight}
            hasCommentUpdateRight={hasCommentUpdateRight}
            me={me}
            onCommentCreate={onCommentCreate}
            onCommentDelete={onCommentDelete}
            onCommentUpdate={onCommentUpdate}
            onGetAsset={onGetAsset}
            onGroupGet={onGroupGet}
            onNavigateToItemEdit={onNavigateToItemEdit}
          />
        </ThreadWrapper>
        <RequestSidebarWrapper
          currentRequest={currentRequest}
          isAssignActionEnabled={isAssignActionEnabled}
          onRequestUpdate={onRequestUpdate}
          workspaceUserMembers={workspaceUserMembers}
        />
      </BodyWrapper>
    </Content>
  );
};

const Content = styled.div`
  padding: 16px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

const BodyWrapper = styled.div`
  padding: 12px 0 0 24px;
  display: flex;
  gap: 11px;
`;

const ThreadWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`;

export default RequestMolecule;
