import styled from "@emotion/styled";

import Badge from "@reearth-cms/components/atoms/Badge";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tag from "@reearth-cms/components/atoms/Tag";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Typography from "@reearth-cms/components/atoms/Typography";
import { VersionedItem } from "@reearth-cms/components/molecules/Content/types";
import { stateColors } from "@reearth-cms/components/molecules/Content/utils";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

type Props = {
  versions: VersionedItem[];
  versionClick: (versionedItem: VersionedItem) => Promise<void>;
  onNavigateToRequest: (id: string) => void;
};

const Versions: React.FC<Props> = ({ versions, versionClick, onNavigateToRequest }) => {
  const t = useT();
  return (
    <>
      {versions.map((version, index) => (
        <HistoryCard key={version.version}>
          <HistoryTitle onClick={() => versionClick(version)}>
            <Tooltip title={t(version.status)}>
              <Badge color={stateColors[version.status]} data-testid="requestStatus" />
            </Tooltip>
            {dateTimeFormat(version.timestamp, "YYYY/MM/DD, HH:mm")}
            {index === 0 && (
              <span>
                <Tag bordered={false} color="processing">
                  {t("current")}
                </Tag>
              </span>
            )}
          </HistoryTitle>
          <HistoryInfo>
            <User>{`${index === versions.length - 1 ? t("Created by") : t("Updated by")} ${version.creator.name}`}</User>
            {version.status === "REVIEW" && (
              <Requests>
                {version.requests?.map(request => (
                  <RequestWrapper
                    role="link"
                    key={request.id}
                    onClick={() => onNavigateToRequest(request.id)}>
                    <Icon icon="pullRequest" />
                    <RequestTitle>{request.title}</RequestTitle>
                  </RequestWrapper>
                ))}
              </Requests>
            )}
          </HistoryInfo>
        </HistoryCard>
      ))}
    </>
  );
};

const HistoryCard = styled.div`
  background-color: #fff;
  padding: 12px;
`;

const HistoryTitle = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 12px;
  margin: 0;
  cursor: pointer;
  :hover {
    text-decoration: underline;
    > span {
      text-decoration: none;
    }
  }
`;

const HistoryInfo = styled.div`
  margin-left: 14px;
  line-height: 1.75;
  font-size: 12px;
`;

const User = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  color: #9a9a9a;
`;

const Requests = styled.div`
  margin-top: 4px;
`;

const RequestWrapper = styled(Typography.Link)`
  display: flex;
  gap: 4px;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
`;

const RequestTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default Versions;
