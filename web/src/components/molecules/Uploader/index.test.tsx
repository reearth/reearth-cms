import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { JobStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { t } from "@reearth-cms/i18n";
import { DATA_TEST_ID, Test } from "@reearth-cms/test/utils";

import Uploader from "./index";
import { UploaderHookState, UploaderHookStateContext } from "./provider";
import { UploaderQueueItem, UploaderState } from "./types";

const createQueueItem = (overrides?: Partial<UploaderQueueItem>): UploaderQueueItem => ({
  extension: "csv",
  file: Test.createMockRcFile({ name: "sample.csv", type: "text/csv" }),
  fileName: "sample.csv",
  jobId: "jobId",
  jobState: {
    progress: {
      percentage: 10,
      processed: 0,
      total: 0,
    },
    status: JobStatus.InProgress,
  },
  modelId: "modelId",
  projectId: "projectId",
  url: "/assets/sample.csv",
  workspaceId: "workspaceId",
  ...overrides,
});

const createMockUploaderState = (overrides?: Partial<UploaderState>): UploaderState => ({
  isOpen: false,
  queue: [],
  showBadge: false,
  ...overrides,
});

const createMockUploaderContext = (overrides?: Partial<UploaderHookState>): UploaderHookState => ({
  handleCancelAll: vi.fn().mockResolvedValue(undefined),
  handleEnqueueJob: vi.fn().mockResolvedValue(undefined),
  handleJobUpdate: vi.fn(),
  handleUploadCancel: vi.fn().mockResolvedValue(undefined),
  handleUploaderOpen: vi.fn(),
  handleUploadRetry: vi.fn().mockResolvedValue(undefined),
  isShowUploader: true,
  shouldPreventReload: false,
  uploaderState: createMockUploaderState(),
  uploadingFileCount: 0,
  ...overrides,
});

const renderWithUploaderProvider = (contextOverrides?: Partial<UploaderHookState>) =>
  render(
    <MemoryRouter>
      <UploaderHookStateContext.Provider value={createMockUploaderContext(contextOverrides)}>
        <Uploader constraintsRef={{ current: document.createElement("div") }} />
      </UploaderHookStateContext.Provider>
    </MemoryRouter>,
  );

vi.mock("./useJobState", () => ({
  default: vi.fn(),
}));

beforeEach(() => {
  document.body.innerHTML = "";
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("Test Uploader component", () => {
  test("Shows uploading title and queue item", () => {
    renderWithUploaderProvider({
      uploaderState: createMockUploaderState({
        isOpen: true,
        queue: [createQueueItem()],
        showBadge: true,
      }),
      uploadingFileCount: 1,
    });

    expect(screen.getByText(t("Uploading file..."))).toBeInTheDocument();
    expect(screen.getByText("sample.csv")).toBeInTheDocument();
  });

  test("Opens uploader after clicking upload icon", () => {
    renderWithUploaderProvider({
      uploaderState: createMockUploaderState({ isOpen: false }),
    });

    const test = screen.getByTestId(DATA_TEST_ID.Uploader__UploadIcon);
    expect(test).not.toBeNull();

    const pointerEventProps = {
      clientX: 10,
      clientY: 10,
      isPrimary: true,
      pointerId: 1,
      pointerType: "mouse",
    };

    fireEvent.pointerDown(test as Element, pointerEventProps);
    fireEvent.pointerUp(test as Element, pointerEventProps);
  });

  describe("Test item actions behavior", () => {
    test("Cancel all items when no items are in-progress", () => {
      const handleCancelAll = vi.fn().mockResolvedValue(undefined);
      const handleUploaderOpen = vi.fn();
      const completedItem = createQueueItem({
        jobId: "job-completed",
        jobState: {
          progress: { percentage: 100, processed: 100, total: 100 },
          status: JobStatus.Completed,
        },
      });

      renderWithUploaderProvider({
        handleCancelAll,
        handleUploaderOpen,
        shouldPreventReload: false,
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [completedItem],
        }),
      });

      const closeIcon = screen.getByTestId(DATA_TEST_ID.Uploader__CancelAllIcon);
      fireEvent.click(closeIcon);

      expect(handleUploaderOpen).toHaveBeenCalledWith(false);
      expect(handleCancelAll).toHaveBeenCalled();
    });

    test("Shows confirmation modal after clicking close icon when some items still in-progress", async () => {
      const handleCancelAll = vi.fn().mockResolvedValue(undefined);
      const handleUploaderOpen = vi.fn();
      const inProgressItem = createQueueItem({
        jobId: "job-in-progress",
        jobState: {
          progress: { percentage: 10, processed: 0, total: 0 },
          status: JobStatus.InProgress,
        },
      });

      renderWithUploaderProvider({
        handleCancelAll,
        handleUploaderOpen,
        shouldPreventReload: true,
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [inProgressItem],
        }),
      });

      const closeIcon = screen.getByTestId(DATA_TEST_ID.Uploader__CancelAllIcon);
      fireEvent.click(closeIcon);

      expect(await screen.findByText(t("Cancel upload?"))).toBeInTheDocument();
      expect(
        screen.getByText(
          t("Your file hasn't finished uploading yet. Are you sure you want to cancel upload?"),
        ),
      ).toBeInTheDocument();

      expect(handleCancelAll).not.toHaveBeenCalled();
    });

    test('Cancels all items after clicking "cancel upload" button in confirmation modal', async () => {
      const handleCancelAll = vi.fn().mockResolvedValue(undefined);
      const handleUploaderOpen = vi.fn();
      const inProgressItem = createQueueItem({
        jobId: "job-in-progress-2",
        jobState: {
          progress: { percentage: 10, processed: 0, total: 0 },
          status: JobStatus.InProgress,
        },
      });

      renderWithUploaderProvider({
        handleCancelAll,
        handleUploaderOpen,
        shouldPreventReload: true,
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [inProgressItem],
        }),
      });

      const closeIcon = screen.getByTestId(DATA_TEST_ID.Uploader__CancelAllIcon);
      fireEvent.click(closeIcon);

      const cancelUploadButton = await screen.findByRole("button", { name: t("Cancel upload") });
      fireEvent.click(cancelUploadButton);

      expect(handleUploaderOpen).toHaveBeenCalledWith(false);
      expect(handleCancelAll).toHaveBeenCalled();
    });

    test('Keeps uploading when clicking "keep uploading" button in confirmation modal', async () => {
      const handleCancelAll = vi.fn().mockResolvedValue(undefined);
      const handleUploaderOpen = vi.fn();
      const inProgressItem = createQueueItem({
        jobId: "job-in-progress-3",
        jobState: {
          progress: { percentage: 10, processed: 0, total: 0 },
          status: JobStatus.InProgress,
        },
      });

      renderWithUploaderProvider({
        handleCancelAll,
        handleUploaderOpen,
        shouldPreventReload: true,
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [inProgressItem],
        }),
      });

      const closeIcon = screen.getByTestId(DATA_TEST_ID.Uploader__CancelAllIcon);
      fireEvent.click(closeIcon);

      const keepUploadingButton = await screen.findByRole("button", { name: t("Keep uploading") });
      fireEvent.click(keepUploadingButton);

      expect(handleUploaderOpen).not.toHaveBeenCalled();
      expect(handleCancelAll).not.toHaveBeenCalled();
    });
  });
});
