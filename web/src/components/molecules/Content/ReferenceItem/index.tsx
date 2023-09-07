import styled from "@emotion/styled";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import Badge from "@reearth-cms/components/atoms/Badge";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";

import { ItemStatus } from "../types";

type Props = {
  value: string;
  title: string;
  modelId?: string;
  status?: ItemStatus;
  workspaceId?: string;
  projectId?: string;
};

const ReferenceItem: React.FC<Props> = ({
  value,
  title,
  modelId,
  status,
  projectId,
  workspaceId,
}) => {
  const linkTo = useMemo(
    () =>
      workspaceId && projectId && modelId
        ? `/workspace/${workspaceId}/project/${projectId}/content/${modelId}/details/${value}`
        : null,
    [workspaceId, projectId, modelId, value],
  );

  return (
    <StyledReferenceItem>
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
      <Badge
        color={
          status === "PUBLIC"
            ? "#52C41A"
            : status === "REVIEW"
            ? "#F5222D"
            : status === "DRAFT"
            ? "#BFBFBF"
            : ""
        }
      />
    </StyledReferenceItem>
  );
};

const StlyedReferenceTitle = styled.div`
  margin-bottom: 4px;
`;

const StyledReferenceItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  justify-content: space-between;
  flex: 1;
`;

const ReferenceItemName = styled.p`
  margin: 0;
  color: #1890ff;
`;

export default ReferenceItem;
