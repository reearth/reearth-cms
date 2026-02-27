import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { describe, expect, test, vi } from "vitest";

import { Comment as CommentType } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import Comment from "./Comment";

dayjs.extend(relativeTime);
dayjs.extend(utc);

describe("Comments panel", () => {
  const user = userEvent.setup();

  const userId = "userId";
  const hasUpdateRight = true;
  const hasDeleteRight = true;
  const name = "name";
  const content = "content";
  const createdAt = "";
  const fromNow = dayjs(createdAt).fromNow();
  const commentId = "commentId";
  const comment: CommentType = {
    author: { id: userId, name, type: null },
    content,
    createdAt,
    id: commentId,
  };
  const onCommentUpdate = () => {
    return Promise.resolve();
  };
  const onCommentDelete = () => {
    return Promise.resolve();
  };

  test("Author thumbnail, name, createdAt, and content are visible successfully", async () => {
    render(
      <Comment
        comment={comment}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        userId={userId}
      />,
    );

    expect(screen.queryByLabelText("api")).not.toBeInTheDocument();
    expect(screen.getByText(name + " (Myself)")).toBeVisible();
    expect(screen.getByText(fromNow)).toBeVisible();
    expect(screen.getByText(content)).toBeVisible();
  });

  test("Accurate creation time is visible when hovering createdAt text successfully", async () => {
    render(
      <Comment
        comment={comment}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        userId={userId}
      />,
    );

    await user.hover(screen.getByText(fromNow));
    await expect
      .poll(() => screen.getByRole("tooltip", { name: dateTimeFormat(createdAt) }))
      .toBeVisible();
  });

  test("Markdown text is rendered successfully", async () => {
    const headingContent = `# ${content}`;

    render(
      <Comment
        comment={{
          author: { id: userId, name, type: null },
          content: headingContent,
          createdAt,
          id: commentId,
        }}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        userId={userId}
      />,
    );

    const markdown = screen.getByRole("heading", { name: content });
    expect(markdown).toBeVisible();
    expect(screen.queryByText(headingContent)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "edit" }));
    const textarea = screen.getByRole("textbox");
    expect(markdown).not.toBeVisible();
    expect(textarea).toBeVisible();
    expect(textarea).toHaveValue(headingContent);

    await user.click(screen.getByRole("button", { name: "check" }));
    expect(screen.getByRole("heading", { name: content })).toBeVisible();
    expect(textarea).not.toBeVisible();
  });

  test("Buttons are invisible according to user right successfully", async () => {
    const { rerender } = render(
      <Comment
        comment={comment}
        hasDeleteRight={false}
        hasUpdateRight={false}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        userId={userId}
      />,
    );

    expect(screen.queryByRole("button", { name: "delete" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "edit" })).not.toBeInTheDocument();

    rerender(
      <Comment
        comment={comment}
        hasDeleteRight={null}
        hasUpdateRight={null}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        userId={userId}
      />,
    );

    expect(screen.getByRole("button", { name: "delete" })).toBeVisible();
    expect(screen.getByRole("button", { name: "edit" })).toBeVisible();

    rerender(
      <Comment
        comment={comment}
        hasDeleteRight={null}
        hasUpdateRight={null}
        onCommentDelete={onCommentDelete}
        onCommentUpdate={onCommentUpdate}
        userId={""}
      />,
    );

    expect(screen.queryByRole("button", { name: "delete" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "edit" })).not.toBeInTheDocument();
  });

  test("Delete event is called successfully", async () => {
    const onCommentDeleteMock = vi.fn();

    render(
      <Comment
        comment={comment}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onCommentDelete={onCommentDeleteMock}
        onCommentUpdate={onCommentUpdate}
        userId={userId}
      />,
    );

    await user.click(screen.getByRole("button", { name: "delete" }));
    expect(onCommentDeleteMock).toHaveBeenCalledWith(commentId);
  });

  test("Update event is called successfully", async () => {
    const onCommentUpdateMock = vi.fn();

    render(
      <Comment
        comment={comment}
        hasDeleteRight={hasDeleteRight}
        hasUpdateRight={hasUpdateRight}
        onCommentDelete={onCommentUpdate}
        onCommentUpdate={onCommentUpdateMock}
        userId={userId}
      />,
    );

    const editButton = screen.getByRole("button", { name: "edit" });
    await user.click(editButton);
    const checkButton = screen.getByRole("button", { name: "check" });
    await user.click(checkButton);
    expect(onCommentUpdateMock).not.toHaveBeenCalled();

    await user.click(editButton);
    await user.type(screen.getByRole("textbox"), "new");
    await user.click(checkButton);
    expect(onCommentUpdateMock).toHaveBeenCalledWith(commentId, `${content}new`);
  });
});
