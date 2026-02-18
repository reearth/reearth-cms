import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Modal from "@reearth-cms/components/atoms/Modal";
import { JobStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { t } from "@reearth-cms/i18n";
import { DATA_TEST_ID, Test } from "@reearth-cms/test/utils";

import { UploaderHookState, UploaderHookStateContext } from "./provider";
import { UploaderQueueItem, UploaderState } from "./types";

import Uploader from "./index";

const createQueueItem = (overrides?: Partial<UploaderQueueItem>): UploaderQueueItem => ({
  fileName: "sample.csv",
  extension: "csv",
  url: "/assets/sample.csv",
  file: Test.createMockRcFile({ name: "sample.csv", type: "text/csv" }),
  workspaceId: "workspaceId",
  projectId: "projectId",
  modelId: "modelId",
  jobId: "jobId",
  jobState: {
    progress: {
      percentage: 10,
      processed: 0,
      total: 0,
    },
    status: JobStatus.InProgress,
  },
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
  handleJobUpdate: vi.fn(),
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
  Modal.destroyAll();
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
    test("Cancel all items when no items are in-progress", () => {
      const handleCancelAll = vi.fn().mockResolvedValue(undefined);
      const handleUploaderOpen = vi.fn();
      const completedItem = createQueueItem({
        jobId: "job-completed",
        jobState: {
          status: JobStatus.Completed,
          progress: { percentage: 100, processed: 100, total: 100 },
        },
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
        jobState: {
          status: JobStatus.InProgress,
          progress: { percentage: 10, processed: 0, total: 0 },
        },
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

      const cancelModalTitles = await screen.findAllByTestId(
        DATA_TEST_ID.Uploader__CancelModal__Title,
      );
      expect(cancelModalTitles.length).toBeGreaterThan(0);
      expect(cancelModalTitles[0]).toBeInTheDocument();
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
          status: JobStatus.InProgress,
          progress: { percentage: 10, processed: 0, total: 0 },
        },
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

      const cancelUploadButton = await screen.findByTestId(
        DATA_TEST_ID.Uploader__CancelModal__CancelUploadButton,
      );
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
          status: JobStatus.InProgress,
          progress: { percentage: 10, processed: 0, total: 0 },
        },
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

      const keepUploadingButton = await screen.findByTestId(
        DATA_TEST_ID.Uploader__CancelModal__KeepUploadingButton,
      );
      fireEvent.click(keepUploadingButton);

      expect(handleUploaderOpen).not.toHaveBeenCalled();
      expect(handleCancelAll).not.toHaveBeenCalled();
    });
  });
});
