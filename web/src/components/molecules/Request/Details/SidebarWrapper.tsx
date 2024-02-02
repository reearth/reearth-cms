import styled from "@emotion/styled";
import { FocusEventHandler, useCallback, useState } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import Select, { SelectProps } from "@reearth-cms/components/atoms/Select";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import SidebarCard from "@reearth-cms/components/molecules/Request/Details/SidebarCard";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

export type Props = {
  currentRequest?: Request;
  workspaceUserMembers: Member[];
  onRequestUpdate: (data: RequestUpdatePayload) => Promise<void>;
};

const RequestSidebarWrapper: React.FC<Props> = ({
  currentRequest,
  workspaceUserMembers,
  onRequestUpdate,
}) => {
  const t = useT();
  const formattedCreatedAt = dateTimeFormat(currentRequest?.createdAt);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [viewReviewers, toggleViewReviewers] = useState<boolean>(false);
  const currentReviewers = currentRequest?.reviewers;
  const reviewers: SelectProps["options"] = workspaceUserMembers
    ?.filter(
      member =>
        currentReviewers?.findIndex(currentReviewer => currentReviewer.id === member.userId) === -1,
    )
    .reduce(
      (acc, member) => {
        acc?.push({
          label: member.user.name,
          value: member.userId,
          name: member.user.name,
        });
        return acc;
      },
      [] as SelectProps["options"],
    );

  const displayViewReviewers = () => {
    toggleViewReviewers(true);
  };

  const hideViewReviewers = () => {
    toggleViewReviewers(false);
  };

  const handleSubmit: FocusEventHandler<HTMLElement> | undefined = useCallback(async () => {
    const requestId = currentRequest?.id;
    if (!requestId || selectedReviewers.length === 0) {
      hideViewReviewers();
      return;
    }

    const currentReviewersId = currentReviewers?.map(reviewer => reviewer.id) ?? [];
    const reviewersId: string[] | undefined = [...currentReviewersId, ...selectedReviewers];

    try {
      await onRequestUpdate?.({
        requestId: requestId,
        title: currentRequest?.title,
        description: currentRequest?.description,
        state: currentRequest?.state,
        reviewersId: reviewersId,
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
    currentReviewers,
    onRequestUpdate,
    selectedReviewers,
  ]);

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
      <SidebarCard title={t("Created By")}>
        <UserAvatar username={currentRequest?.createdBy?.name} />
      </SidebarCard>
      <SidebarCard title={t("Reviewer")}>
        <ReviewerContainer>
          {currentRequest?.reviewers.map((reviewer, index) => (
            <StyledUserAvatar username={reviewer.name} key={index} />
          ))}
        </ReviewerContainer>
        <Select
          placeholder={t("Reviewer")}
          mode="multiple"
          options={reviewers}
          filterOption={(input, option) =>
            option?.name.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          style={{ width: "100%", display: viewReviewers ? "initial" : "none" }}
          onChange={setSelectedReviewers}
          onBlur={handleSubmit}
          allowClear
        />
        <ViewReviewers viewReviewers={viewReviewers}>
          <StyledButton type="link" onClick={displayViewReviewers}>
            {t("Assign to")}
          </StyledButton>
        </ViewReviewers>
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

const StyledUserAvatar = styled(UserAvatar)`
  margin-right: 8px;
`;

const ReviewerContainer = styled.div`
  display: flex;
  margin: 4px 0;
`;
const ViewReviewers = styled.div<{ viewReviewers: boolean }>`
  display: ${({ viewReviewers }) => (viewReviewers ? "none" : "flex")};
  justify-content: end;
`;

const StyledButton = styled(Button)`
  padding-right: 0;
`;

export default RequestSidebarWrapper;
