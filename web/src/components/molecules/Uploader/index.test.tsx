import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createMockRcFile } from "@reearth-cms/e2e/helpers/mock.helper";
import { JobStatus, JobType } from "@reearth-cms/gql/__generated__/graphql.generated";
import { DATA_TEST_ID } from "@reearth-cms/utils/test";

import { UploaderHookState, UploaderHookStateContext } from "./provider";
import { UploaderQueueItem, UploaderState } from "./types";

import Uploader from "./index";
import { t } from "@reearth-cms/i18n";

const createQueueItem = (overrides?: Partial<UploaderQueueItem>): UploaderQueueItem => ({
  fileName: "sample.csv",
  extension: "csv",
  url: "/assets/sample.csv",
  file: createMockRcFile({ name: "sample.csv", type: "text/csv" }),
  workspaceId: "workspaceId",
  projectId: "projectId",
  modelId: "modelId",
  jobId: "jobId",
  jobProgress: {
    percentage: 10,
    processed: 0,
    total: 0,
  },
  jobType: JobType.Import,
  jobStatus: JobStatus.InProgress,
  ...overrides,
});

const createMockUploaderState = (overrides?: Partial<UploaderState>): UploaderState => ({
  isOpen: false,
  showBadge: false,
  queue: [],
  ...overrides,
});

const createMockUploaderContext = (overrides?: Partial<UploaderHookState>): UploaderHookState => ({
  isShowUploader: true,
  uploaderState: createMockUploaderState(),
  shouldPreventReload: false,
  uploadingFileCount: 0,
  handleUploaderOpen: vi.fn(),
  handleUploadCancel: vi.fn().mockResolvedValue(undefined),
  handleUploadRetry: vi.fn().mockResolvedValue(undefined),
  handleCancelAll: vi.fn().mockResolvedValue(undefined),
  handleEnqueueJob: vi.fn().mockResolvedValue(undefined),
  handleJobProgressUpdate: vi.fn(),
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

vi.mock("./useJobProgress", () => ({
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
        showBadge: true,
        queue: [createQueueItem()],
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
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
    };

    fireEvent.pointerDown(test as Element, pointerEventProps);
    fireEvent.pointerUp(test as Element, pointerEventProps);
  });

  describe("Test item actions behavior", () => {
    test("Cancel in-progress item", () => {
      const handleUploadCancel = vi.fn().mockResolvedValue(undefined);
      const queueItem = createQueueItem({
        jobId: "job-123",
        jobStatus: JobStatus.InProgress,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [queueItem],
        }),
        handleUploadCancel,
      });

      const cancelIcon = screen.getByTestId(DATA_TEST_ID.QueueItem__CancelIcon);
      fireEvent.click(cancelIcon);

      expect(handleUploadCancel).toHaveBeenCalledWith("job-123");
    });

    test("Cancel all items when no items are in-progress", () => {
      const handleCancelAll = vi.fn().mockResolvedValue(undefined);
      const handleUploaderOpen = vi.fn();
      const completedItem = createQueueItem({
        jobId: "job-completed",
        jobStatus: JobStatus.Completed,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [completedItem],
        }),
        shouldPreventReload: false,
        handleCancelAll,
        handleUploaderOpen,
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
        jobStatus: JobStatus.InProgress,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [inProgressItem],
        }),
        shouldPreventReload: true,
        handleCancelAll,
        handleUploaderOpen,
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

    test('Cancels all items after clicking "OK" button in confirmation modal', async () => {
      const handleCancelAll = vi.fn().mockResolvedValue(undefined);
      const handleUploaderOpen = vi.fn();
      const inProgressItem = createQueueItem({
        jobId: "job-in-progress-2",
        jobStatus: JobStatus.InProgress,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [inProgressItem],
        }),
        shouldPreventReload: true,
        handleCancelAll,
        handleUploaderOpen,
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
        jobStatus: JobStatus.InProgress,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [inProgressItem],
        }),
        shouldPreventReload: true,
        handleCancelAll,
        handleUploaderOpen,
      });

      const closeIcon = screen.getByTestId(DATA_TEST_ID.Uploader__CancelAllIcon);
      fireEvent.click(closeIcon);

      const keepUploadingButton = await screen.findByRole("button", { name: t("Keep uploading") });
      fireEvent.click(keepUploadingButton);

      expect(handleUploaderOpen).not.toHaveBeenCalled();
      expect(handleCancelAll).not.toHaveBeenCalled();
    });

    test("Does not show cancel icon for completed items", () => {
      const completedItem = createQueueItem({
        jobId: "job-completed",
        jobStatus: JobStatus.Completed,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [completedItem],
        }),
      });

      const checkIcon = screen.getByTestId(DATA_TEST_ID.Uploader__CompleteIcon);
      expect(checkIcon).toBeInTheDocument();
    });

    test("Shows retry icon for cancelled items", () => {
      const cancelledItem = createQueueItem({
        jobId: "job-cancelled",
        jobStatus: JobStatus.Cancelled,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [cancelledItem],
        }),
      });

      const retryIcon = screen.getByTestId(DATA_TEST_ID.QueueItem__RetryIcon);
      expect(retryIcon).toBeInTheDocument();
    });

    test("Shows retry and error icons for failed items", () => {
      const failedItem = createQueueItem({
        jobId: "job-failed",
        jobStatus: JobStatus.Failed,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [failedItem],
        }),
      });

      const retryIcon = screen.getByTestId(DATA_TEST_ID.QueueItem__RetryIcon);
      expect(retryIcon).toBeInTheDocument();

      const errorIcon = screen.getByTestId(DATA_TEST_ID.QueueItem__ErrorIcon);
      expect(errorIcon).toBeInTheDocument();
    });

    test("Calls handleUploadRetry after clicking retry icon on failed item", () => {
      const handleUploadRetry = vi.fn().mockResolvedValue(undefined);
      const failedItem = createQueueItem({
        jobId: "job-failed-2",
        jobStatus: JobStatus.Failed,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [failedItem],
        }),
        handleUploadRetry,
      });

      const retryIcon = screen.getByTestId(DATA_TEST_ID.QueueItem__RetryIcon);
      expect(retryIcon).toBeInTheDocument();
      fireEvent.click(retryIcon);

      expect(handleUploadRetry).toHaveBeenCalledWith("job-failed-2");
    });
  });

  describe("Test progress bar behavior", () => {
    test("Shows progress bar when job is in progress", () => {
      const inProgressItem = createQueueItem({
        jobId: "job-progress-1",
        jobStatus: JobStatus.InProgress,
        jobProgress: { percentage: 50, processed: 50, total: 100 },
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [inProgressItem],
        }),
      });

      const progressBar = screen.getByTestId(DATA_TEST_ID.QueueItem__ProgressBar);
      expect(progressBar).toBeInTheDocument();
    });

    test("Progress bar shows correct percentage", () => {
      const inProgressItem = createQueueItem({
        jobId: "job-progress-2",
        jobStatus: JobStatus.InProgress,
        jobProgress: { percentage: 75, processed: 75, total: 100 },
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [inProgressItem],
        }),
      });

      const progressBar = screen.getByTestId(DATA_TEST_ID.QueueItem__ProgressBar);
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "75");
    });

    test("Progress bar shows 0 percent when jobProgress is undefined", () => {
      const inProgressItem = createQueueItem({
        jobId: "job-progress-3",
        jobStatus: JobStatus.InProgress,
        jobProgress: undefined,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [inProgressItem],
        }),
      });

      const progressBar = screen.getByTestId(DATA_TEST_ID.QueueItem__ProgressBar);
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "0");
    });

    test("Does not show progress bar when job is completed", () => {
      const completedItem = createQueueItem({
        jobId: "job-completed-progress",
        jobStatus: JobStatus.Completed,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [completedItem],
        }),
      });

      const progressBar = screen.queryByTestId(DATA_TEST_ID.QueueItem__ProgressBar);
      expect(progressBar).not.toBeInTheDocument();
    });

    test("Does not show progress bar when job is failed", () => {
      const failedItem = createQueueItem({
        jobId: "job-failed-progress",
        jobStatus: JobStatus.Failed,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [failedItem],
        }),
      });

      const progressBar = screen.queryByTestId(DATA_TEST_ID.QueueItem__ProgressBar);
      expect(progressBar).not.toBeInTheDocument();
    });

    test("Does not show progress bar when job is cancelled", () => {
      const cancelledItem = createQueueItem({
        jobId: "job-cancelled-progress",
        jobStatus: JobStatus.Cancelled,
      });

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({
          isOpen: true,
          queue: [cancelledItem],
        }),
      });

      const progressBar = screen.queryByTestId(DATA_TEST_ID.QueueItem__ProgressBar);
      expect(progressBar).not.toBeInTheDocument();
    });
  });
});
