import styled from "@emotion/styled";
import { FocusEventHandler, useCallback, useState, useMemo } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import SidebarCard from "@reearth-cms/components/molecules/Request/Details/SidebarCard";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { badgeColors } from "@reearth-cms/components/molecules/Request/utils";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

const { Option } = Select;

type Props = {
  currentRequest: Request;
  workspaceUserMembers: UserMember[];
  isAssignActionEnabled: boolean;
  onRequestUpdate: (data: RequestUpdatePayload) => Promise<void>;
};

const RequestSidebarWrapper: React.FC<Props> = ({
  currentRequest,
  workspaceUserMembers,
  isAssignActionEnabled,
  onRequestUpdate,
}) => {
  const t = useT();
  const formattedCreatedAt = dateTimeFormat(currentRequest?.createdAt);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [viewReviewers, toggleViewReviewers] = useState<boolean>(false);

  const defaultValue = useMemo(() => {
    return currentRequest?.reviewers.map(reviewer => reviewer.id);
  }, [currentRequest?.reviewers]);

  const reviewers: { label: string; value: string }[] = useMemo(() => {
    return workspaceUserMembers.map(member => ({
      label: member.user.name,
      value: member.userId,
    }));
  }, [workspaceUserMembers]);

  const displayViewReviewers = useCallback(() => {
    toggleViewReviewers(true);
  }, []);

  const hideViewReviewers = useCallback(() => {
    toggleViewReviewers(false);
  }, []);

  const handleSubmit: FocusEventHandler<HTMLElement> | undefined = useCallback(async () => {
    const requestId = currentRequest?.id;
    const isEqual =
      JSON.stringify([...defaultValue].sort()) === JSON.stringify([...selectedReviewers].sort());
    if (!requestId || selectedReviewers.length === 0 || isEqual) {
      hideViewReviewers();
      return;
    }

    try {
      await onRequestUpdate({
        requestId: requestId,
        title: currentRequest?.title,
        description: currentRequest?.description,
        state: currentRequest?.state,
        reviewersId: selectedReviewers,
      });
    } catch (error) {
      console.error("Validate Failed:", error);
    } finally {
      hideViewReviewers();
    }
  }, [
    currentRequest?.description,
    currentRequest?.id,
    currentRequest?.state,
    currentRequest?.title,
    defaultValue,
    hideViewReviewers,
    onRequestUpdate,
    selectedReviewers,
  ]);

  return (
    <SideBarWrapper>
      <SidebarCard title={t("State")}>
        <Badge color={badgeColors[currentRequest.state]} text={t(currentRequest.state)} />
      </SidebarCard>
      <SidebarCard title={t("Created By")}>
        <StyledSpace>
          <UserAvatar username={currentRequest?.createdBy?.name} />
          {currentRequest?.createdBy?.name}
        </StyledSpace>
      </SidebarCard>
      <SidebarCard title={t("Reviewer")}>
        <ReviewerContainer>
          {currentRequest?.reviewers.map((reviewer, index) => (
            <UserAvatar username={reviewer.name} key={index} />
          ))}
        </ReviewerContainer>
        {viewReviewers ? (
          <StyledSelect
            autoFocus
            defaultValue={defaultValue}
            placeholder={t("Reviewer")}
            mode="multiple"
            filterOption={(input, option) =>
              option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={value => setSelectedReviewers(value as string[])}
            onBlur={handleSubmit}
            allowClear>
            {reviewers.map(reviewer => (
              <Option key={reviewer.value} label={reviewer.label}>
                <Space>
                  <UserAvatar username={reviewer.label} size={22} />
                  {reviewer.label}
                </Space>
              </Option>
            ))}
          </StyledSelect>
        ) : (
          <ViewReviewers>
            <StyledButton
              type="link"
              onClick={displayViewReviewers}
              disabled={!isAssignActionEnabled}>
              {t("Assign to")}
            </StyledButton>
          </ViewReviewers>
        )}
      </SidebarCard>
      <SidebarCard title={t("Created Time")}>{formattedCreatedAt}</SidebarCard>
    </SideBarWrapper>
  );
};

const SideBarWrapper = styled.div`
  background-color: #fafafa;
  padding: 8px;
  width: 272px;
`;

const StyledSpace = styled(Space)`
  width: 100%;
  .ant-space-item:nth-child(2) {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

const ReviewerContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin: 4px 0;
`;

const StyledSelect = styled(Select)`
  width: 100%;
`;

const ViewReviewers = styled.div`
  text-align: right;
`;

const StyledButton = styled(Button)`
  padding-right: 0;
`;

export default RequestSidebarWrapper;
