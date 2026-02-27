import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

vi.mock("@reearth-cms/i18n", () => ({
  useT: () => (key: string) => key,
}));

import { UploadFile } from "@reearth-cms/components/atoms/Upload";

import FileItem from "./FileItem";

const makeFile = (name: string, extra?: Partial<UploadFile>): UploadFile => ({
  uid: "1",
  name,
  ...extra,
});

describe("FileItem", () => {
  test("renders file name", () => {
    render(<FileItem file={makeFile("test.png")} remove={vi.fn()} />);
    expect(screen.getByText("test.png")).toBeInTheDocument();
  });

  test("renders remove button", () => {
    render(<FileItem file={makeFile("test.png")} remove={vi.fn()} />);
    expect(screen.getByTitle("Remove file")).toBeInTheDocument();
  });

  test("clicking remove calls callback", async () => {
    const user = userEvent.setup();
    const remove = vi.fn();
    render(<FileItem file={makeFile("test.png")} remove={remove} />);
    await user.click(screen.getByTitle("Remove file"));
    expect(remove).toHaveBeenCalledOnce();
  });

  test("no Auto Unzip checkbox for non-compressed file", () => {
    render(<FileItem file={makeFile("document.pdf")} remove={vi.fn()} />);
    expect(screen.queryByText("Auto Unzip")).not.toBeInTheDocument();
  });

  test("shows Auto Unzip checkbox for .zip file", () => {
    render(<FileItem file={makeFile("archive.zip")} remove={vi.fn()} />);
    expect(screen.getByText("Auto Unzip")).toBeInTheDocument();
  });

  test("shows Auto Unzip checkbox for .7z file", () => {
    render(<FileItem file={makeFile("archive.7z")} remove={vi.fn()} />);
    expect(screen.getByText("Auto Unzip")).toBeInTheDocument();
  });

  test("checkbox checked by default when skipDecompression is falsy", () => {
    render(<FileItem file={makeFile("archive.zip")} remove={vi.fn()} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  test("checkbox unchecked when skipDecompression is true", () => {
    render(
      <FileItem
        file={makeFile("archive.zip", { skipDecompression: true })}
        remove={vi.fn()}
      />,
    );
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  test("clicking checkbox toggles checked state", async () => {
    const user = userEvent.setup();
    render(<FileItem file={makeFile("archive.zip")} remove={vi.fn()} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test("clicking checkbox sets skipDecompression on file object", async () => {
    const user = userEvent.setup();
    const file = makeFile("archive.zip");
    render(<FileItem file={file} remove={vi.fn()} />);
    await user.click(screen.getByRole("checkbox"));
    expect(file.skipDecompression).toBe(true);
  });

  test("double-click restores skipDecompression", async () => {
    const user = userEvent.setup();
    const file = makeFile("archive.zip");
    render(<FileItem file={file} remove={vi.fn()} />);
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(file.skipDecompression).toBe(true);
    await user.click(checkbox);
    expect(file.skipDecompression).toBe(false);
  });
});
