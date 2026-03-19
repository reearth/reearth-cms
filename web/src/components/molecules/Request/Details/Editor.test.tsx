import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import RequestEditor from "./Editor";

describe("RequestEditor", () => {
  const user = userEvent.setup();

  test("textarea is disabled when hasCommentCreateRight is false", () => {
    render(<RequestEditor hasCommentCreateRight={false} onCommentCreate={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  test("submit button is initially disabled", () => {
    render(<RequestEditor hasCommentCreateRight={true} onCommentCreate={vi.fn()} />);
    expect(screen.getByTestId(DATA_TEST_ID.RequestDetail__AddCommentButton)).toBeDisabled();
  });

  test("typing enables submit button and clicking calls onCommentCreate", async () => {
    const onCommentCreate = vi.fn().mockResolvedValue(undefined);
    render(<RequestEditor hasCommentCreateRight={true} onCommentCreate={onCommentCreate} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "New comment");
    expect(screen.getByTestId(DATA_TEST_ID.RequestDetail__AddCommentButton)).not.toBeDisabled();

    await user.click(screen.getByTestId(DATA_TEST_ID.RequestDetail__AddCommentButton));
    expect(onCommentCreate).toHaveBeenCalledWith("New comment");
  });

  test("form resets after successful submit", async () => {
    const onCommentCreate = vi.fn().mockResolvedValue(undefined);
    render(<RequestEditor hasCommentCreateRight={true} onCommentCreate={onCommentCreate} />);

    await user.type(screen.getByRole("textbox"), "temp");
    await user.click(screen.getByTestId(DATA_TEST_ID.RequestDetail__AddCommentButton));

    expect(screen.getByTestId(DATA_TEST_ID.RequestDetail__AddCommentButton)).toBeDisabled();
  });
});
