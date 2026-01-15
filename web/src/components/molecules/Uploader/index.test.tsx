import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { DATA_TEST_ID } from "@reearth-cms/utils/test";

import { UploaderQueueItem, UploadStatus } from "./types";

import Uploader from "./index";

const createQueueItem = (overrides?: Partial<UploaderQueueItem>): UploaderQueueItem => ({
  id: "queue-id",
  status: UploadStatus.InProgress,
  fileName: "sample.csv",
  fileContent: [],
  progress: 10,
  url: "/assets/sample.csv",
  error: null,
  ...overrides,
});

describe("Test Uploader component", () => {
  test("Shows uploading title and queue item", () => {
    const uploaderState = {
      isOpen: true,
      showBadge: true,
      queue: [createQueueItem()],
    };

    render(
      <Uploader
        uploaderState={uploaderState}
        constraintsRef={{ current: document.createElement("div") }}
        onUploaderOpen={vi.fn()}
        onRetry={vi.fn()}
        onCancel={vi.fn()}
        onCancelAll={vi.fn()}
      />,
    );

    expect(screen.getByText("Uploading file...")).toBeInTheDocument();
    expect(screen.getByText("sample.csv")).toBeInTheDocument();
  });

  test("Opens uploader when upload icon is clicked", () => {
    const onUploaderOpen = vi.fn();
    const uploaderState = {
      isOpen: false,
      showBadge: false,
      queue: [createQueueItem({ status: UploadStatus.Queued })],
    };

    const { container } = render(
      <Uploader
        uploaderState={uploaderState}
        constraintsRef={{ current: document.createElement("div") }}
        onUploaderOpen={onUploaderOpen}
        onRetry={vi.fn()}
        onCancel={vi.fn()}
        onCancelAll={vi.fn()}
      />,
    );

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

    expect(onUploaderOpen).toHaveBeenCalledTimes(1);
    expect(onUploaderOpen).toHaveBeenCalledWith(true);
  });
});
