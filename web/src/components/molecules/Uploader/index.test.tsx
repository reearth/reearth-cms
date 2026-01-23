import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { DATA_TEST_ID } from "@reearth-cms/utils/test";

import { UploaderQueueItem, UploaderState } from "./types";

import Uploader from "./index";
import { JobStatus, JobType } from "@reearth-cms/gql/__generated__/graphql.generated";
import { createMockRcFile } from "@reearth-cms/e2e/helpers/mock.helper";
import { UploaderHookState, UploaderHookStateContext } from "./provider";

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
  currentJobId: null,
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
  testRefetchJobs: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const renderWithUploaderProvider = (contextOverrides?: Partial<UploaderHookState>) =>
  render(
    <UploaderHookStateContext.Provider value={createMockUploaderContext(contextOverrides)}>
      <Uploader constraintsRef={{ current: document.createElement("div") }} />
    </UploaderHookStateContext.Provider>,
  );

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

    expect(screen.getByText("Uploading file...")).toBeInTheDocument();
    expect(screen.getByText("sample.csv")).toBeInTheDocument();
  });

  test("Opens uploader when upload icon is clicked", () => {
    const { container } = renderWithUploaderProvider({
      uploaderState: createMockUploaderState({ isOpen: false }),
    });

    const uploadIcon = container.querySelector(
      `[data-testId="${DATA_TEST_ID.UploaderUploadIcon}"]`,
    );
    expect(uploadIcon).not.toBeNull();

    const pointerEventProps = {
      clientX: 10,
      clientY: 10,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
    };

    fireEvent.pointerDown(uploadIcon as Element, pointerEventProps);
    fireEvent.pointerUp(uploadIcon as Element, pointerEventProps);
  });
});
