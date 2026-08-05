import styled from "@emotion/styled";

import Badge from "@reearth-cms/components/atoms/Badge";
import type { StateType } from "@reearth-cms/components/molecules/Content/Table/types";
import type { ItemStatus } from "@reearth-cms/components/molecules/Content/types";
import { stateColors } from "@reearth-cms/components/molecules/Content/utils";
import { useT } from "@reearth-cms/i18n";
import { AntdToken } from "@reearth-cms/utils/style";

type Props = {
  status: ItemStatus;
};

const Status: React.FC<Props> = ({ status }) => {
  const t = useT();
  const itemStatusTitle = {
    DRAFT: t("DRAFT"),
    PUBLIC: t("Published"),
    REVIEW: t("REVIEW"),
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
  gap: ${AntdToken.SPACING.XXS}px;
  white-space: nowrap;
  overflow: hidden;
`;

export default Status;
