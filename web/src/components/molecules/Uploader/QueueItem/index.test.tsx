import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import { JobStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { DATA_TEST_ID, Test } from "@reearth-cms/test/utils";

import { type UploaderQueueItem } from "../types";

import QueueItem from ".";

vi.mock("../useJobStatus", () => ({
  default: vi.fn(),
}));

const user = userEvent.setup();

const baseQueue: UploaderQueueItem = {
  jobId: "queue-1",
  jobState: { status: JobStatus.Pending, progress: null },
  fileName: "test.csv",
  extension: "csv",
  url: "/assets/test.csv",
  file: Test.createMockRcFile({ name: "test.csv" }),
  workspaceId: "workspace-1",
  projectId: "project-1",
  modelId: "model-1",
};

const renderQueueItem = (
  queue: UploaderQueueItem,
  props?: Partial<ComponentProps<typeof QueueItem>>,
) => {
  const onRetry = vi.fn().mockResolvedValue(undefined);
  const onCancel = vi.fn().mockResolvedValue(undefined);
  const onJobProgressUpdate = vi.fn();

  render(
    <MemoryRouter>
      <QueueItem
        queue={queue}
        onRetry={onRetry}
        onCancel={onCancel}
        onJobUpdate={onJobProgressUpdate}
        {...props}
      />
    </MemoryRouter>,
  );

  return { onRetry, onCancel };
};

describe("Test QueueItem component", () => {
  test("Test completed item", () => {
    renderQueueItem({
      ...baseQueue,
      jobState: {
        status: JobStatus.Completed,
        progress: { percentage: 100, processed: 100, total: 100 },
      },
    });

    const progressBar = screen.queryByTestId(DATA_TEST_ID.QueueItem__ProgressBar);
    expect(progressBar).not.toBeInTheDocument();

    const link = screen.getByTestId(DATA_TEST_ID.QueueItem__FileLink);
    expect(link).toBeVisible();
    expect(link).toHaveTextContent(baseQueue.fileName);
    expect(link).toHaveAttribute("href", baseQueue.url);
  });

  test("Test in progress item", async () => {
    const { onCancel } = renderQueueItem({
      ...baseQueue,
      jobState: {
        status: JobStatus.InProgress,
        progress: { percentage: 42, processed: 42, total: 100 },
      },
    });

    const progressBar = screen.queryByTestId(DATA_TEST_ID.QueueItem__ProgressBar);
    expect(progressBar).toBeVisible();
    expect(progressBar).toHaveAttribute("aria-valuenow", "42");

    const cancelIcon = screen.queryByTestId(DATA_TEST_ID.QueueItem__CancelIcon);
    expect(cancelIcon).toBeVisible();
    if (cancelIcon) await user.click(cancelIcon);

    expect(onCancel).toHaveBeenCalledWith(baseQueue.jobId);
  });

  test("Test failed item", async () => {
    const { onRetry } = renderQueueItem({
      ...baseQueue,
      jobState: { status: JobStatus.Failed, progress: null, error: "upload failed" },
    });

    const progressBar = screen.queryByTestId(DATA_TEST_ID.QueueItem__ProgressBar);
    expect(progressBar).not.toBeInTheDocument();

    const errorMessage = screen.queryByTestId(DATA_TEST_ID.QueueItem__ErrorMessage);
    expect(errorMessage).toBeVisible();
    expect(errorMessage).toHaveTextContent("upload failed");

    const errorIcon = screen.queryByTestId(DATA_TEST_ID.QueueItem__ErrorIcon);
    expect(errorIcon).toBeVisible();

    const retryIcon = screen.queryByTestId(DATA_TEST_ID.QueueItem__RetryIcon);
    expect(retryIcon).toBeVisible();
    if (retryIcon) await user.click(retryIcon);

    expect(onRetry).toHaveBeenCalledWith(baseQueue.jobId);
  });

  test("Test cancelled item", async () => {
    const { onRetry } = renderQueueItem({
      ...baseQueue,
      jobState: { status: JobStatus.Cancelled, progress: null },
    });

    const progressBar = screen.queryByTestId(DATA_TEST_ID.QueueItem__ProgressBar);
    expect(progressBar).not.toBeInTheDocument();

    const retryIcon = screen.queryByTestId(DATA_TEST_ID.QueueItem__RetryIcon);
    expect(retryIcon).toBeVisible();
    if (retryIcon) await user.click(retryIcon);

    expect(onRetry).toHaveBeenCalledWith(baseQueue.jobId);
  });

  test("Test pending item", async () => {
    renderQueueItem({
      ...baseQueue,
      jobState: { status: JobStatus.Pending, progress: null },
    });

    const progressBar = screen.queryByTestId(DATA_TEST_ID.QueueItem__ProgressBar);
    expect(progressBar).not.toBeInTheDocument();

    const retryIcon = screen.queryByTestId(DATA_TEST_ID.QueueItem__RetryIcon);
    expect(retryIcon).not.toBeInTheDocument();

    const cancelIcon = screen.queryByTestId(DATA_TEST_ID.QueueItem__CancelIcon);
    expect(cancelIcon).not.toBeInTheDocument();

    const errorIcon = screen.queryByTestId(DATA_TEST_ID.QueueItem__ErrorIcon);
    expect(errorIcon).not.toBeInTheDocument();
  });
});
