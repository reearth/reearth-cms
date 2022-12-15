import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu from "@reearth-cms/components/atoms/Menu";
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

  const RequestMenu = (
    <Menu
      items={[
        {
          key: "delete",
          label: t("Delete"),
          onClick: () => onRequestDelete([currentRequest.id]),
        },
      ]}
    />
  );

  return (
    <Content>
      <PageHeader
        title={currentRequest.title}
        onBack={onBack}
        extra={
          <>
            <Button type="primary" onClick={() => onRequestApprove(currentRequest.id)}>
              {t("Approve")}
            </Button>
            <Dropdown key="options" overlay={RequestMenu} trigger={["click"]}>
              <Button icon={<Icon icon="ellipsis" />} />
            </Dropdown>
          </>
        }
      />
      <BodyWrapper>
        <ThreadWrapper>
          <RequestThread onCommentCreate={onCommentCreate} />
        </ThreadWrapper>
        <RequestSidebarWrapper />
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
