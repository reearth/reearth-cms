import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import Editor from "./Editor";

describe("Comments panel", () => {
  const user = userEvent.setup();

  const isInputDisabled = false;
  const onCommentCreate = () => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  };

  test("Textbox is toggled successfully", async () => {
    render(<Editor isInputDisabled={isInputDisabled} onCommentCreate={onCommentCreate} />);

    const textbox = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: "Comment" });
    expect(button).toBeDisabled();

    await user.type(textbox, "test");
    expect(button).toBeEnabled();

    await user.clear(textbox);
    expect(button).toBeDisabled();
  });

  test("Input is disabled successfully", async () => {
    render(<Editor isInputDisabled={true} onCommentCreate={onCommentCreate} />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  test("Create event is called successfully", async () => {
    const onCommentCreateMock = vi.fn(onCommentCreate);
    render(<Editor isInputDisabled={isInputDisabled} onCommentCreate={onCommentCreateMock} />);

    const button = screen.getByRole("button", { name: "Comment" });

    const content = "content";
    await user.type(screen.getByRole("textbox"), content);
    await user.click(button);
    const loading = screen.getByLabelText("loading");
    expect(button).toBeDisabled();
    expect(loading).toBeVisible();
    expect(onCommentCreateMock).toHaveBeenCalledWith(content);
    expect(button).toBeDisabled();
    await expect.poll(() => loading).not.toBeVisible();
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  test("Handling when creating fais successfully", async () => {
    render(
      <Editor
        isInputDisabled={isInputDisabled}
        onCommentCreate={() => {
          return new Promise<void>((_, reject) => {
            setTimeout(() => {
              reject();
            }, 100);
          });
        }}
      />,
    );

    const button = screen.getByRole("button", { name: "Comment" });

    await user.type(screen.getByRole("textbox"), "test");
    expect(button).toBeEnabled();
    await user.click(button);
    expect(button).toBeDisabled();
    await expect.poll(() => button).toBeEnabled();
  });
});
