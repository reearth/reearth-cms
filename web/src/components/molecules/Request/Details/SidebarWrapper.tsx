import styled from "@emotion/styled";

import SideBarCard from "@reearth-cms/components/molecules/Request/Details/sideBarCard";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  currentRequest?: Request;
};

const RequestSidebarWrapper: React.FC<Props> = ({ currentRequest }) => {
  const t = useT();

  return (
    <SideBarWrapper>
      <SideBarCard title={t("State")}>Waiting</SideBarCard>
      <SideBarCard title={t("Created By")}>User</SideBarCard>
      <SideBarCard title={t("Created Time")}>
        <>{currentRequest?.createdAt}</>
      </SideBarCard>
    </SideBarWrapper>
  );
};

const SideBarWrapper = styled.div`
  background-color: #fff;
  padding: 8px;
  width: 272px;
`;

export default RequestSidebarWrapper;
