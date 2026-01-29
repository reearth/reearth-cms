import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import { createMockRcFile } from "@reearth-cms/e2e/helpers/mock.helper";
import { JobStatus, JobType } from "@reearth-cms/gql/__generated__/graphql.generated";
import { DATA_TEST_ID } from "@reearth-cms/utils/test";

import { type UploaderQueueItem } from "../types";

import QueueItem from ".";

vi.mock("../useJobProgress", () => ({
  default: vi.fn(),
}));

describe("Test QueueItem component", () => {
  const user = userEvent.setup();

  const baseQueue: UploaderQueueItem = {
    jobId: "queue-1",
    jobStatus: JobStatus.Pending,
    jobType: JobType.Import,
    jobProgress: null,
    fileName: "test.csv",
    extension: "csv",
    url: "/assets/test.csv",
    file: createMockRcFile({ name: "test.csv" }),
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
          onJobProgressUpdate={onJobProgressUpdate}
          {...props}
        />
      </MemoryRouter>,
    );

    return { onRetry, onCancel };
  };

  test("Show link for completed item", () => {
    renderQueueItem({ ...baseQueue, jobStatus: JobStatus.Completed });

    const link = screen.getByTestId(DATA_TEST_ID.QueueItem__FileLink);
    expect(link).toHaveTextContent(baseQueue.fileName);
    expect(link).toHaveAttribute("href", baseQueue.url);
  });

  test("Shows progress and allows cancel for in progress item", async () => {
    const { onCancel } = renderQueueItem({
      ...baseQueue,
      jobStatus: JobStatus.InProgress,
      jobProgress: {
        percentage: 42,
        processed: 42,
        total: 100,
      },
    });

    expect(screen.getByTestId(DATA_TEST_ID.QueueItem__ProgressBar)).toHaveAttribute(
      "aria-valuenow",
      "42",
    );

    const cancelIcon = screen.getByTestId(DATA_TEST_ID.QueueItem__CancelIcon);
    await user.click(cancelIcon);

    expect(onCancel).toHaveBeenCalledWith(baseQueue.jobId);
  });

  test("Shows retry action for failed item", async () => {
    const { onRetry } = renderQueueItem({
      ...baseQueue,
      jobStatus: JobStatus.Failed,
    });

    const retryIcon = screen.getByTestId(DATA_TEST_ID.QueueItem__RetryIcon);
    await user.click(retryIcon);

    expect(onRetry).toHaveBeenCalledWith(baseQueue.jobId);
  });

  test("Shows retry action for canceled item", async () => {
    const { onRetry } = renderQueueItem({
      ...baseQueue,
      jobStatus: JobStatus.Cancelled,
    });

    const retryIcon = screen.getByTestId(DATA_TEST_ID.QueueItem__RetryIcon);
    await user.click(retryIcon);

    expect(onRetry).toHaveBeenCalledWith(baseQueue.jobId);
  });
});
