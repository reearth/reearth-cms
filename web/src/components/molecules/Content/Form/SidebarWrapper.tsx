import styled from "@emotion/styled";

import SidebarCard from "@reearth-cms/components/molecules/Request/Details/SidebarCard";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import { Item } from "../types";

export type Props = {
  item: Item;
};

const ContentSidebarWrapper: React.FC<Props> = ({ item }) => {
  const t = useT();

  return (
    <SideBarWrapper>
      <SidebarCard title={t("Enter Information")}>
        <DataRow>
          <DataTitle>ID</DataTitle>
          <DataText>{item.id}</DataText>
        </DataRow>
        <DataRow>
          <DataTitle>{t("Created At")}</DataTitle>
          <DataText>{dateTimeFormat(item.createdAt)}</DataText>
        </DataRow>
        <DataRow>
          <DataTitle>{t("Updated At")}</DataTitle>
          <DataText>{dateTimeFormat(item.updatedAt)}</DataText>
        </DataRow>
      </SidebarCard>
    </SideBarWrapper>
  );
};

const SideBarWrapper = styled.div`
  background-color: #fafafa;
  padding: 8px;
  width: 272px;
`;

const DataRow = styled.div`
  display: flex;
  margin: 0 -4px;
  align-items: center;
`;

const DataTitle = styled.div`
  font-size: 14px;
  line-height: 22px;
  padding: 4px;
`;

const DataText = styled.div`
  text-align: end;
  flex: 1;
  color: #00000073;
  font-size: 12px;
  line-height: 22px;
  padding: 4px;
`;

export default ContentSidebarWrapper;
