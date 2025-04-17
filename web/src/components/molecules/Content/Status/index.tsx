import styled from "@emotion/styled";

import Badge from "@reearth-cms/components/atoms/Badge";
import { StateType } from "@reearth-cms/components/molecules/Content/Table/types";
import { ItemStatus } from "@reearth-cms/components/molecules/Content/types";
import { stateColors } from "@reearth-cms/components/molecules/Content/utils";
import { useT } from "@reearth-cms/i18n";

type Props = {
  status: ItemStatus;
};

const Status: React.FC<Props> = ({ status }) => {
  const t = useT();
  const itemStatusTitle = {
    DRAFT: t("Draft"),
    PUBLIC: t("Published"),
    REVIEW: t("Review"),
  };

  const itemStatus = status.split("_") as StateType[];
  let text = t(itemStatusTitle[itemStatus[0]]);
  if (itemStatus.length === 2) {
    text += ` & ${t(itemStatusTitle[itemStatus[1]])}`;
  }
  return (
    <BadgeWrapper>
      {itemStatus.map((state, index) => (
        <Badge
          key={index}
          color={stateColors[state]}
          text={index === itemStatus.length - 1 ? text : undefined}
        />
      ))}
    </BadgeWrapper>
  );
};

const BadgeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
`;

export default Status;
