import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

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

const renderWithUploaderProvider = (contextOverrides?: Partial<UploaderHookState>) => {
  return render(
    <MemoryRouter>
      <UploaderHookStateContext.Provider value={createMockUploaderContext(contextOverrides)}>
        <Uploader constraintsRef={{ current: document.createElement("div") }} />
      </UploaderHookStateContext.Provider>
    </MemoryRouter>,
  );
};

vi.mock("./useJobState", () => ({
  default: vi.fn(),
}));

describe("Uploader", () => {
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

        const keepUploadingButton = await screen.findByRole("button", {
          name: t("Keep uploading"),
        });
        fireEvent.click(keepUploadingButton);

        expect(handleUploaderOpen).not.toHaveBeenCalled();
        expect(handleCancelAll).not.toHaveBeenCalled();
      });
    });

    test("Shows badge dot when showBadge is true", () => {
      const { container } = renderWithUploaderProvider({
        uploaderState: createMockUploaderState({ showBadge: true }),
      });

      expect(container.querySelector(".ant-badge-dot")).toBeInTheDocument();
    });

    test("Does not show badge dot when showBadge is false", () => {
      const { container } = renderWithUploaderProvider({
        uploaderState: createMockUploaderState({ showBadge: false }),
      });

      expect(container.querySelector(".ant-badge-dot")).not.toBeInTheDocument();
    });

    test("Shows empty title when uploadingFileCount is 0", () => {
      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({ isOpen: true }),
        uploadingFileCount: 0,
      });

      const title = screen.getByTestId(DATA_TEST_ID.Uploader__CardTitle);
      expect(title).toHaveTextContent("");
    });

    test("Calls handleUploaderOpen(false) on minimize icon click", () => {
      const handleUploaderOpen = vi.fn();

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({ isOpen: true }),
        handleUploaderOpen,
      });

      const minimizeIcon = screen.getByTestId(DATA_TEST_ID.Uploader__MinimizeIcon);
      fireEvent.click(minimizeIcon);

      expect(handleUploaderOpen).toHaveBeenCalledWith(false);
    });

    test("Does not open uploader when pointer distance >= threshold (drag)", () => {
      const handleUploaderOpen = vi.fn();

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({ isOpen: false }),
        handleUploaderOpen,
      });

      const uploadIcon = screen.getByTestId(DATA_TEST_ID.Uploader__UploadIcon);

      fireEvent.pointerDown(uploadIcon, {
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
      });
      fireEvent.pointerUp(uploadIcon, {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
      });

      expect(handleUploaderOpen).not.toHaveBeenCalled();
    });

    test("Calls handleUploaderOpen(true) when click distance < threshold", () => {
      const handleUploaderOpen = vi.fn();

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({ isOpen: false }),
        handleUploaderOpen,
      });

      const uploadIcon = screen.getByTestId(DATA_TEST_ID.Uploader__UploadIcon);

      fireEvent.pointerDown(uploadIcon, {
        clientX: 10,
        clientY: 10,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
      });
      fireEvent.pointerUp(uploadIcon, {
        clientX: 11,
        clientY: 11,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
      });

      expect(handleUploaderOpen).toHaveBeenCalledWith(true);
    });

    test("Renders multiple queue items in card body", () => {
      const items = [
        createQueueItem({ jobId: "job-1", fileName: "file1.csv" }),
        createQueueItem({ jobId: "job-2", fileName: "file2.csv" }),
        createQueueItem({ jobId: "job-3", fileName: "file3.csv" }),
      ];

      renderWithUploaderProvider({
        uploaderState: createMockUploaderState({ isOpen: true, queue: items }),
      });

      const queueItems = screen.getAllByTestId(DATA_TEST_ID.QueueItem__Wrapper);
      expect(queueItems).toHaveLength(3);
    });
  });
});
