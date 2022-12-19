import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import RequestThread from "@reearth-cms/components/molecules/Request/Details/Thread";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

import RequestSidebarWrapper from "./SidebarWrapper";

type Props = {
  me?: User;
  currentRequest: Request;
  workspaceUserMembers: Member[];
  onRequestApprove: (requestId: string) => Promise<void>;
  onRequestUpdate: (data: RequestUpdatePayload) => Promise<void>;
  onRequestDelete: (requestsId: string[]) => Promise<void>;
  onCommentCreate: (content: string) => Promise<void>;
  onBack: () => void;
};

const RequestMolecule: React.FC<Props> = ({
  me,
  currentRequest,
  workspaceUserMembers,
  onCommentCreate,
  onRequestApprove,
  onRequestUpdate,
  onRequestDelete,
  onBack,
}) => {
  const t = useT();

  return (
    <Content>
      <PageHeader
        title={currentRequest.title}
        onBack={onBack}
        extra={
          <>
            <Button
              disabled={currentRequest.state === "CLOSED" || currentRequest.state === "APPROVED"}
              onClick={() => onRequestDelete([currentRequest.id])}>
              {t("Close")}
            </Button>
            <Button
              disabled={currentRequest.state !== "WAITING"}
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
            currentRequest={currentRequest}
            onCommentCreate={onCommentCreate}
          />
        </ThreadWrapper>
        <RequestSidebarWrapper
          currentRequest={currentRequest}
          workspaceUserMembers={workspaceUserMembers}
          onRequestUpdate={onRequestUpdate}
        />
      </BodyWrapper>
    </Content>
  );
};

const Content = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fafafa;
`;

const BodyWrapper = styled.div`
  padding: 24px;
  display: flex;
`;

const ThreadWrapper = styled.div`
  flex: 1;
`;

export default RequestMolecule;
