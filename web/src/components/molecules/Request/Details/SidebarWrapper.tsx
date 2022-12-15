import styled from "@emotion/styled";

import Badge from "@reearth-cms/components/atoms/Badge";
import SidebarCard from "@reearth-cms/components/molecules/Request/Details/SidebarCard";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

export type Props = {
  currentRequest?: Request;
};

const RequestSidebarWrapper: React.FC<Props> = ({ currentRequest }) => {
  const t = useT();
  const formattedCreatedAt = dateTimeFormat(currentRequest?.createdAt);

  return (
    <SideBarWrapper>
      <SidebarCard title={t("State")}>
        <Badge
          color={
            currentRequest?.state === "APPROVED"
              ? "#52C41A"
              : currentRequest?.state === "CLOSED"
              ? "#F5222D"
              : currentRequest?.state === "WAITING"
              ? "#FA8C16"
              : ""
          }
          text={currentRequest?.state}
        />
      </SidebarCard>
      <SidebarCard title={t("Created By")}>{currentRequest?.createdBy?.name}</SidebarCard>
      <SidebarCard title={t("Created Time")}>{formattedCreatedAt}</SidebarCard>
    </SideBarWrapper>
  );
};

const SideBarWrapper = styled.div`
  background-color: #fff;
  padding: 8px;
  width: 272px;
`;

export default RequestSidebarWrapper;
