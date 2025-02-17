import styled from "@emotion/styled";

import Badge from "@reearth-cms/components/atoms/Badge";
import Tag from "@reearth-cms/components/atoms/Tag";
import { StateType } from "@reearth-cms/components/molecules/Content/Table/types";
import { Item, ItemStatus } from "@reearth-cms/components/molecules/Content/types";
import { stateColors } from "@reearth-cms/components/molecules/Content/utils";
import SidebarCard from "@reearth-cms/components/molecules/Request/Details/SidebarCard";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

type Props = {
  item?: Item;
};

const ContentSidebarWrapper: React.FC<Props> = ({ item }) => {
  const t = useT();

  const getStatusBadge = (status: ItemStatus) => {
    const itemStatus = status.split("_") as StateType[];
    return (
      <>
        {itemStatus.map((state, index) => (
          <StyledBadge
            key={index}
            color={stateColors[state]}
            text={index === itemStatus.length - 1 ? t(state) : undefined}
          />
        ))}
      </>
    );
  };

  return (
    <>
      {item && (
        <>
          <SidebarCard title={t("Item Information")}>
            <DataRow>
              <DataTitle>ID</DataTitle>
              <StyledTag>{item.id}</StyledTag>
            </DataRow>
            <DataRow>
              <DataTitle>{t("Created At")}</DataTitle>
              <DataText>{dateTimeFormat(item.createdAt)}</DataText>
            </DataRow>
            <DataRow>
              <DataTitle>{t("Created By")}</DataTitle>
              <DataText>{item.createdBy?.name}</DataText>
            </DataRow>
            <DataRow>
              <DataTitle>{t("Updated At")}</DataTitle>
              <DataText>{dateTimeFormat(item.updatedAt)}</DataText>
            </DataRow>
            <DataRow>
              <DataTitle>{t("Updated By")}</DataTitle>
              <DataText>{item.updatedBy?.name}</DataText>
            </DataRow>
          </SidebarCard>
          <SidebarCard title={t("Publish State")}>
            <DataRow>
              <DataTitle>{getStatusBadge(item.status)}</DataTitle>
            </DataRow>
          </SidebarCard>
        </>
      )}
    </>
  );
};

const DataRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0;
  line-height: 22px;
`;

const DataTitle = styled.div`
  font-size: 14px;
`;

const DataText = styled.div`
  color: #00000073;
  font-size: 12px;
  flex: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTag = styled(Tag)`
  margin: 0;
  color: #00000073;
  background-color: #f0f0f0;
`;

const StyledBadge = styled(Badge)`
  + * {
    margin-left: 4px;
  }
`;

export default ContentSidebarWrapper;
