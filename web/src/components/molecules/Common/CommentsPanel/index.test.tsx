import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { describe, expect, test, vi } from "vitest";

import CommentsPanel from ".";

dayjs.extend(relativeTime);
dayjs.extend(utc);

describe("Comments panel", () => {
  const user = userEvent.setup();

  const userId = "userId";
  const hasCreateRight = true;
  const hasUpdateRight = true;
  const hasDeleteRight = true;
  const resourceId = "";
  const comments = undefined;
  const collapsed = false;
  const onCollapse = () => {};
  const onCommentCreate = () => {
    return Promise.resolve();
  };
  const onCommentUpdate = () => {
    return Promise.resolve();
  };
  const onCommentDelete = () => {
    return Promise.resolve();
  };

  test("Title, placeholder, input, button, and unfold icon are visible successfully", async () => {
    render(
      <CommentsPanel
        collapsed={collapsed}
        comments={comments}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onCollapse={onCollapse}
        onCommentCreate={onCommentCreate}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        resourceId={resourceId}
        userId={userId}
      />,
    );

    const commentButton = screen.getByRole("button", { name: "Comment" });
    const textbox = screen.getByRole("textbox");

    expect(screen.getByRole("heading", { name: "Comments" })).toBeVisible();
    expect(screen.getByText(/Please click/)).toBeVisible();
    expect(textbox).toBeVisible();
    expect(textbox).toBeDisabled();
    expect(commentButton).toBeVisible();
    expect(commentButton).toBeDisabled();
    expect(screen.getByLabelText("menu-unfold")).toBeVisible();
  });

  test("Correct placeholder is visible when no comment exists successfully", async () => {
    render(
      <CommentsPanel
        collapsed={collapsed}
        comments={[]}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onCollapse={onCollapse}
        onCommentCreate={onCommentCreate}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        resourceId={resourceId}
        userId={userId}
      />,
    );

    expect(screen.getByRole("textbox")).toBeEnabled();
    expect(screen.getByText("No comments.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Comment" })).toBeDisabled();
  });

  test("Comment panel is collapsed successfully", async () => {
    render(
      <CommentsPanel
        collapsed={true}
        comments={comments}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onCollapse={onCollapse}
        onCommentCreate={onCommentCreate}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        resourceId={resourceId}
        userId={userId}
      />,
    );

    expect(screen.queryByRole("heading", { name: "Comments" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("comment")).toBeVisible();
    expect(screen.getByLabelText("menu-fold")).toBeVisible();
  });

  test("Textbox is disabled according to user right successfully", async () => {
    render(
      <CommentsPanel
        collapsed={collapsed}
        comments={[]}
        hasCreateRight={false}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onCollapse={onCollapse}
        onCommentCreate={onCommentCreate}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        resourceId={resourceId}
        userId={userId}
      />,
    );

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  test("Comments are visible successfully", async () => {
    const content1 = "content1";
    const content2 = "content2";

    render(
      <CommentsPanel
        collapsed={collapsed}
        comments={[
          {
            author: { name: "", type: null },
            content: content1,
            createdAt: "",
            id: "",
          },
          {
            author: { name: "", type: null },
            content: content2,
            createdAt: "",
            id: "",
          },
        ]}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onCollapse={onCollapse}
        onCommentCreate={onCommentCreate}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        resourceId={resourceId}
        userId={userId}
      />,
    );

    expect(screen.getByText(content1)).toBeVisible();
    expect(screen.getByText(content2)).toBeVisible();
  });

  test("Collapse event is called successfully", async () => {
    const onCollapseMock = vi.fn();
    const { rerender } = render(
      <CommentsPanel
        collapsed={collapsed}
        comments={comments}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onCollapse={onCollapseMock}
        onCommentCreate={onCommentCreate}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        resourceId={resourceId}
        userId={userId}
      />,
    );

    await user.click(screen.getByRole("heading"));
    expect(onCollapseMock).toHaveBeenCalledWith(true);

    rerender(
      <CommentsPanel
        collapsed={true}
        comments={comments}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onCollapse={onCollapseMock}
        onCommentCreate={onCommentCreate}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        resourceId={resourceId}
        userId={userId}
      />,
    );
    await user.click(screen.getByLabelText("comment"));
    expect(onCollapseMock).toHaveBeenCalledWith(false);
  });
});
