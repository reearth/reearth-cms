import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { AssetFile, ArchiveExtractionStatus } from "@reearth-cms/components/molecules/Asset/types";
import { render } from "@reearth-cms/test/utils";

import UnzipFileList from ".";

vi.mock("@reearth-cms/i18n", () => ({ useT: () => (key: string) => key }));
vi.mock("@reearth-cms/components/atoms/Icon", () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));
vi.mock("@reearth-cms/components/atoms/CopyButton", () => ({
  default: () => <span data-testid="copy-button" />,
}));

const createFile = (overrides?: Partial<AssetFile>): AssetFile => ({
  name: "root",
  path: "/",
  filePaths: ["/folder1/file1.txt", "/folder1/file2.txt"],
  ...overrides,
});

const defaultProps = {
  file: createFile(),
  assetBaseUrl: "https://example.com/assets",
  archiveExtractionStatus: undefined as ArchiveExtractionStatus,
  setAssetUrl: vi.fn(),
};

describe("UnzipFileList", () => {
  test("renders spinner when status is IN_PROGRESS", () => {
    const { container } = render(
      <UnzipFileList {...defaultProps} archiveExtractionStatus="IN_PROGRESS" />,
    );
    expect(container.querySelector(".ant-spin-spinning")).toBeInTheDocument();
    expect(screen.queryByText("file1.txt")).not.toBeInTheDocument();
  });

  test("renders spinner when status is PENDING", () => {
    const { container } = render(
      <UnzipFileList {...defaultProps} archiveExtractionStatus="PENDING" />,
    );
    expect(container.querySelector(".ant-spin-spinning")).toBeInTheDocument();
    expect(screen.queryByText("file1.txt")).not.toBeInTheDocument();
  });

  test("renders error icon and message when status is FAILED", () => {
    render(<UnzipFileList {...defaultProps} archiveExtractionStatus="FAILED" />);
    expect(screen.getByTestId("icon-closeCircle")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to decompress. Please check the file and try again."),
    ).toBeInTheDocument();
  });

  test("renders tree when status is DONE", () => {
    render(<UnzipFileList {...defaultProps} archiveExtractionStatus="DONE" />);
    expect(screen.getByText("file1.txt")).toBeInTheDocument();
    expect(screen.getByText("file2.txt")).toBeInTheDocument();
  });

  test("renders tree when status is undefined", () => {
    render(<UnzipFileList {...defaultProps} archiveExtractionStatus={undefined} />);
    expect(screen.getByText("file1.txt")).toBeInTheDocument();
    expect(screen.getByText("file2.txt")).toBeInTheDocument();
  });

  test("calls setAssetUrl with correct URL on file selection", async () => {
    const setAssetUrl = vi.fn();
    const user = userEvent.setup();
    render(
      <UnzipFileList {...defaultProps} setAssetUrl={setAssetUrl} archiveExtractionStatus="DONE" />,
    );
    const file1 = screen.getByText("file1.txt");
    await user.click(file1);
    await waitFor(() => {
      expect(setAssetUrl).toHaveBeenCalledWith("https://example.com/assets/folder1/file1.txt");
    });
  });
});
