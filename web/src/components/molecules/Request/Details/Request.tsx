import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import RequestThread from "@reearth-cms/components/molecules/Request/Details/Thread";
import { useT } from "@reearth-cms/i18n";

type Props = {};

const RequestMolecule: React.FC<Props> = () => {
  const t = useT();
  return (
    <Content>
      <PageHeader
        title={"Request name"}
        onBack={() => {}}
        extra={
          <>
            <Button>{t("Close")}</Button>
            <Button type="primary">{t("Approve")}</Button>
          </>
        }
      />
      <BodyWrapper>
        <RequestThread
          onCommentCreate={async (content: string) => {
            console.log(content);
          }}
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
`;

export default RequestMolecule;
