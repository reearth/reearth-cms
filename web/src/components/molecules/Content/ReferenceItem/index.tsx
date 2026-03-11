import styled from "@emotion/styled";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import Badge from "@reearth-cms/components/atoms/Badge";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { StateType } from "@reearth-cms/components/molecules/Content/Table/types";
import { stateColors } from "@reearth-cms/components/molecules/Content/utils";
import { AntdColor } from "@reearth-cms/utils/color";

import { ItemStatus } from "../types";

type Props = {
  value: string;
  title: string;
  modelId?: string;
  status?: ItemStatus;
  workspaceId?: string;
  projectId?: string;
  disabled?: boolean;
};

const ReferenceItem: React.FC<Props> = ({
  value,
  title,
  modelId,
  status,
  projectId,
  workspaceId,
  disabled,
}) => {
  const itemStatus: StateType[] = useMemo(() => status?.split("_") as StateType[], [status]);

  const linkTo = useMemo(
    () =>
      workspaceId && projectId && modelId
        ? `/workspace/${workspaceId}/project/${projectId}/content/${modelId}/details/${value}`
        : null,
    [workspaceId, projectId, modelId, value],
  );

  return (
    <StyledReferenceItem disabled={disabled}>
      <Tooltip title={title}>
        <StlyedReferenceTitle>{title}</StlyedReferenceTitle>
        {linkTo ? (
          <Link to={linkTo} target="_blank">
            <ReferenceItemName>{value}</ReferenceItemName>
          </Link>
        ) : (
          <ReferenceItemName>{value}</ReferenceItemName>
        )}
      </Tooltip>
      <div>
        {itemStatus?.map((state, index) => (
          <StyledBadge key={index} color={stateColors[state]} />
        ))}
      </div>
    </StyledReferenceItem>
  );
};

const StlyedReferenceTitle = styled.div`
  margin-bottom: 4px;
`;

const StyledReferenceItem = styled.div<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: ${({ disabled }) => (disabled ? AntdColor.NEUTRAL.FILL_TERTIARY : AntdColor.NEUTRAL.BG_ELEVATED)};
  border: 1px solid ${AntdColor.NEUTRAL.BORDER};
  border-radius: 4px;
  justify-content: space-between;
  flex: 1;
`;

const ReferenceItemName = styled.p`
  margin: 0;
  color: ${AntdColor.BLUE.BLUE_5};
`;

const StyledBadge = styled(Badge)`
  + * {
    margin-left: 4px;
  }
`;

export default ReferenceItem;
