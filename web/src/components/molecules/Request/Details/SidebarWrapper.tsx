import styled from "@emotion/styled";

import SidebarCard from "@reearth-cms/components/molecules/Request/Details/SidebarCard";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  currentRequest?: Request;
};

const RequestSidebarWrapper: React.FC<Props> = ({ currentRequest }) => {
  const t = useT();

  return (
    <SideBarWrapper>
      <SidebarCard title={t("State")}>Waiting</SidebarCard>
      <SidebarCard title={t("Created By")}>User</SidebarCard>
      <SidebarCard title={t("Created Time")}>
        <>{currentRequest?.createdAt}</>
      </SidebarCard>
    </SideBarWrapper>
  );
};

const SideBarWrapper = styled.div`
  background-color: #fff;
  padding: 8px;
  width: 272px;
`;

export default RequestSidebarWrapper;
