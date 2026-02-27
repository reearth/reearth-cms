import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

vi.mock("@reearth-cms/i18n", () => ({
  useT: () => (key: string) => key,
}));

import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import UploadModal from "./UploadModal";

const DEFAULT_PROPS = {
  visible: true,
  uploadProps: {},
  fileList: [] as never[],
  alertList: [],
  uploading: false,
  uploadUrl: { url: "", autoUnzip: false },
  uploadType: "local" as const,
  setUploadUrl: vi.fn(),
  setUploadType: vi.fn(),
  onUpload: vi.fn(),
  onCancel: vi.fn(),
  onUploadModalClose: vi.fn(),
};

describe("UploadModal", () => {
  test("renders Asset Uploader title when visible", () => {
    render(<UploadModal {...DEFAULT_PROPS} />);
    expect(screen.getByText("Asset Uploader")).toBeInTheDocument();
  });

  test("renders Local and URL tab labels", () => {
    render(<UploadModal {...DEFAULT_PROPS} />);
    expect(screen.getByTestId(DATA_TEST_ID.UploadModal__LocalTab)).toHaveTextContent("Local");
    expect(screen.getByTestId(DATA_TEST_ID.UploadModal__UrlTab)).toHaveTextContent("URL");
  });

  test("submit button shows Upload by default", () => {
    render(<UploadModal {...DEFAULT_PROPS} />);
    expect(screen.getByTestId(DATA_TEST_ID.UploadModal__SubmitButton)).toHaveTextContent(
      "Upload",
    );
  });

  test("submit button shows Upload and Link when alsoLink", () => {
    render(<UploadModal {...DEFAULT_PROPS} alsoLink />);
    expect(screen.getByTestId(DATA_TEST_ID.UploadModal__SubmitButton)).toHaveTextContent(
      "Upload and Link",
    );
  });

  test("submit button shows Uploading when uploading", () => {
    render(<UploadModal {...DEFAULT_PROPS} uploading />);
    expect(screen.getByTestId(DATA_TEST_ID.UploadModal__SubmitButton)).toHaveTextContent(
      "Uploading",
    );
  });

  test("submit button disabled when fileList empty and url empty", () => {
    render(<UploadModal {...DEFAULT_PROPS} />);
    expect(screen.getByTestId(DATA_TEST_ID.UploadModal__SubmitButton)).toBeDisabled();
  });

  test("submit button enabled when fileList has items", () => {
    render(
      <UploadModal
        {...DEFAULT_PROPS}
        fileList={[{ uid: "1", name: "test.png" }]}
      />,
    );
    expect(screen.getByTestId(DATA_TEST_ID.UploadModal__SubmitButton)).not.toBeDisabled();
  });

  test("submit button enabled when uploadUrl.url is non-empty", () => {
    render(
      <UploadModal
        {...DEFAULT_PROPS}
        uploadUrl={{ url: "https://example.com/file.png", autoUnzip: false }}
      />,
    );
    expect(screen.getByTestId(DATA_TEST_ID.UploadModal__SubmitButton)).not.toBeDisabled();
  });

  test("cancel button disabled when uploading", () => {
    render(<UploadModal {...DEFAULT_PROPS} uploading />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  test("cancel button enabled when not uploading", () => {
    render(<UploadModal {...DEFAULT_PROPS} />);
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
  });

  test("clicking submit calls onUpload", async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    render(
      <UploadModal
        {...DEFAULT_PROPS}
        onUpload={onUpload}
        fileList={[{ uid: "1", name: "test.png" }]}
      />,
    );
    await user.click(screen.getByTestId(DATA_TEST_ID.UploadModal__SubmitButton));
    expect(onUpload).toHaveBeenCalledOnce();
  });

  test("clicking cancel calls onCancel", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<UploadModal {...DEFAULT_PROPS} onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  test("tab change calls setUploadType", async () => {
    const user = userEvent.setup();
    const setUploadType = vi.fn();
    render(<UploadModal {...DEFAULT_PROPS} setUploadType={setUploadType} />);
    await user.click(screen.getByTestId(DATA_TEST_ID.UploadModal__UrlTab));
    expect(setUploadType).toHaveBeenCalledWith("url");
  });
});
