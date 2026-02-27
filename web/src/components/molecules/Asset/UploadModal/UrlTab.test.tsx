import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import UrlTab from "./UrlTab";

vi.mock("@reearth-cms/i18n", () => ({
  useT: () => (key: string) => key,
}));

const defaultUrl = { url: "", autoUnzip: false };

describe("UrlTab", () => {
  test("renders URL input with data-testid", () => {
    render(<UrlTab uploadUrl={defaultUrl} setUploadUrl={vi.fn()} />);
    expect(screen.getByTestId(DATA_TEST_ID.UploadModal__UrlInput)).toBeInTheDocument();
  });

  test("renders URL label", () => {
    render(<UrlTab uploadUrl={defaultUrl} setUploadUrl={vi.fn()} />);
    expect(screen.getByText("URL")).toBeInTheDocument();
  });

  test("input onChange calls setUploadUrl", async () => {
    const user = userEvent.setup();
    const setUploadUrl = vi.fn();
    render(<UrlTab uploadUrl={defaultUrl} setUploadUrl={setUploadUrl} />);
    await user.type(screen.getByTestId(DATA_TEST_ID.UploadModal__UrlInput), "a");
    expect(setUploadUrl).toHaveBeenCalledWith({ url: "a", autoUnzip: false });
  });

  test("no Auto Unzip checkbox for non-compressed URL", () => {
    render(
      <UrlTab
        uploadUrl={{ url: "https://example.com/file.pdf", autoUnzip: false }}
        setUploadUrl={vi.fn()}
      />,
    );
    expect(screen.queryByText("Auto Unzip")).not.toBeInTheDocument();
  });

  test("shows Auto Unzip checkbox for .zip URL", () => {
    render(
      <UrlTab
        uploadUrl={{ url: "https://example.com/archive.zip", autoUnzip: false }}
        setUploadUrl={vi.fn()}
      />,
    );
    expect(screen.getByText("Auto Unzip")).toBeInTheDocument();
  });

  test("shows Auto Unzip checkbox for .7z URL", () => {
    render(
      <UrlTab
        uploadUrl={{ url: "https://example.com/archive.7z", autoUnzip: false }}
        setUploadUrl={vi.fn()}
      />,
    );
    expect(screen.getByText("Auto Unzip")).toBeInTheDocument();
  });

  test("clicking checkbox calls setUploadUrl toggling autoUnzip false to true", async () => {
    const user = userEvent.setup();
    const setUploadUrl = vi.fn();
    render(
      <UrlTab
        uploadUrl={{ url: "https://example.com/archive.zip", autoUnzip: false }}
        setUploadUrl={setUploadUrl}
      />,
    );
    await user.click(screen.getByRole("checkbox"));
    expect(setUploadUrl).toHaveBeenCalledWith({
      url: "https://example.com/archive.zip",
      autoUnzip: true,
    });
  });

  test("clicking checkbox calls setUploadUrl toggling autoUnzip true to false", async () => {
    const user = userEvent.setup();
    const setUploadUrl = vi.fn();
    render(
      <UrlTab
        uploadUrl={{ url: "https://example.com/archive.zip", autoUnzip: true }}
        setUploadUrl={setUploadUrl}
      />,
    );
    await user.click(screen.getByRole("checkbox"));
    expect(setUploadUrl).toHaveBeenCalledWith({
      url: "https://example.com/archive.zip",
      autoUnzip: false,
    });
  });

  test("syncs form field value on prop change via useEffect", async () => {
    const { rerender } = render(
      <UrlTab
        uploadUrl={{ url: "https://old.com/file.txt", autoUnzip: false }}
        setUploadUrl={vi.fn()}
      />,
    );

    rerender(
      <UrlTab
        uploadUrl={{ url: "https://new.com/file.txt", autoUnzip: false }}
        setUploadUrl={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId(DATA_TEST_ID.UploadModal__UrlInput)).toHaveValue(
        "https://new.com/file.txt",
      );
    });
  });
});
