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
  me?: User;
  hasCommentCreateRight: boolean;
  hasCommentUpdateRight: boolean | null;
  hasCommentDeleteRight: boolean | null;
  isCloseActionEnabled: boolean;
  isReopenActionEnabled: boolean;
  isApproveActionEnabled: boolean;
  isAssignActionEnabled: boolean;
  currentRequest: Request;
  workspaceUserMembers: UserMember[];
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

const RequestMolecule: React.FC<Props> = ({
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
  deleteLoading,
  approveLoading,
  updateLoading,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
  onRequestApprove,
  onRequestUpdate,
  onRequestDelete,
  onBack,
  onNavigateToItemEdit,
  onGetAsset,
  onGroupGet,
}) => {
  const t = useT();

  return (
    <Content>
      <PageHeader
        title={`${t("Request")} / ${currentRequest.title}`}
        onBack={onBack}
        style={{ backgroundColor: "#fff" }}
        extra={
          <>
            <Button
              disabled={!isCloseActionEnabled}
              loading={deleteLoading}
              onClick={() => onRequestDelete([currentRequest.id])}>
              {t("Close")}
            </Button>
            <Button
              hidden={currentRequest.state !== "CLOSED"}
              disabled={!isReopenActionEnabled}
              loading={updateLoading}
              onClick={() =>
                onRequestUpdate({
                  requestId: currentRequest.id,
                  title: currentRequest?.title,
                  description: currentRequest?.description,
                  reviewersId: currentRequest.reviewers.map(reviewer => reviewer.id),
                  state: "WAITING",
                })
              }>
              {t("Reopen")}
            </Button>
            <Button
              disabled={!isApproveActionEnabled}
              loading={approveLoading}
              type="primary"
              onClick={() => onRequestApprove(currentRequest.id)}>
              {t("Approve")}
            </Button>
          </>
        }
      />
      <BodyWrapper>
        <ThreadWrapper>
          <RequestThread
            me={me}
            hasCommentCreateRight={hasCommentCreateRight}
            hasCommentUpdateRight={hasCommentUpdateRight}
            hasCommentDeleteRight={hasCommentDeleteRight}
            currentRequest={currentRequest}
            onCommentCreate={onCommentCreate}
            onCommentUpdate={onCommentUpdate}
            onCommentDelete={onCommentDelete}
            onGetAsset={onGetAsset}
            onGroupGet={onGroupGet}
            onNavigateToItemEdit={onNavigateToItemEdit}
          />
        </ThreadWrapper>
        <RequestSidebarWrapper
          currentRequest={currentRequest}
          workspaceUserMembers={workspaceUserMembers}
          isAssignActionEnabled={isAssignActionEnabled}
          onRequestUpdate={onRequestUpdate}
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
