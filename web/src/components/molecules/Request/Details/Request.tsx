import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import RequestThread from "@reearth-cms/components/molecules/Request/Details/Thread";
import { useT } from "@reearth-cms/i18n";

import { Request } from "../types";

import RequestSidebarWrapper from "./SidebarWrapper";

type Props = {
  currentRequest: Request;
  onRequestApprove: (requestId: string) => Promise<void>;
  onRequestDelete: (requestsId: string[]) => Promise<void>;
  onCommentCreate: (content: string) => Promise<void>;
  onBack: () => void;
};

const RequestMolecule: React.FC<Props> = ({
  currentRequest,
  onCommentCreate,
  onRequestApprove,
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
            {currentRequest.state !== "CLOSED" && (
              <Button type="primary" onClick={() => onRequestDelete([currentRequest.id])}>
                {t("Close")}
              </Button>
            )}
            {currentRequest.state === "WAITING" && (
              <Button type="primary" onClick={() => onRequestApprove(currentRequest.id)}>
                {t("Approve")}
              </Button>
            )}
          </>
        }
      />
      <BodyWrapper>
        <ThreadWrapper>
          <RequestThread comments={currentRequest.comments} onCommentCreate={onCommentCreate} />
        </ThreadWrapper>
        <RequestSidebarWrapper currentRequest={currentRequest} />
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
