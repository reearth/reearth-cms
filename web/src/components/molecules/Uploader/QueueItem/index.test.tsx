import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import type { ImportJobResult } from "@reearth-cms/gql/__generated__/graphql.generated";
import { ImportColumnStatus, JobStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { DATA_TEST_ID, Test } from "@reearth-cms/test/utils";

import type { UploaderQueueItem } from "../types";

import QueueItem from ".";

vi.mock("../useJobState", () => ({
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

const completedJobState: UploaderQueueItem["jobState"] = {
  status: JobStatus.Completed,
  progress: { percentage: 100, processed: 100, total: 100 },
};

const allMatchedResult: ImportJobResult = {
  total: 100,
  inserted: 80,
  updated: 20,
  ignored: 0,
  columns: [
    { header: "name", status: ImportColumnStatus.Matched, schemaFieldKey: "name", reason: null },
    { header: "age", status: ImportColumnStatus.Matched, schemaFieldKey: "age", reason: null },
  ],
};

const skippedResult: ImportJobResult = {
  ...allMatchedResult,
  columns: [
    ...allMatchedResult.columns,
    {
      header: "unknown_a",
      status: ImportColumnStatus.Skipped,
      schemaFieldKey: null,
      reason: "no matching schema field for header 'unknown_a'",
    },
    {
      header: "unknown_b",
      status: ImportColumnStatus.Skipped,
      schemaFieldKey: null,
      reason: "no matching schema field for header 'unknown_b'",
    },
  ],
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

  test("Test completed CSV item with all columns matched", () => {
    renderQueueItem({
      ...baseQueue,
      jobState: completedJobState,
      importResult: allMatchedResult,
    });

    expect(screen.getByTestId(DATA_TEST_ID.Uploader__CompleteIcon)).toBeVisible();
    expect(screen.queryByTestId(DATA_TEST_ID.QueueItem__WarningIcon)).not.toBeInTheDocument();
    expect(screen.queryByTestId(DATA_TEST_ID.QueueItem__WarningMessage)).not.toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.QueueItem__ViewDetailsLink)).toBeVisible();
  });

  test("Test completed CSV item with skipped columns", async () => {
    renderQueueItem({
      ...baseQueue,
      jobState: completedJobState,
      importResult: skippedResult,
    });

    expect(screen.getByTestId(DATA_TEST_ID.QueueItem__WarningIcon)).toBeVisible();
    expect(screen.queryByTestId(DATA_TEST_ID.Uploader__CompleteIcon)).not.toBeInTheDocument();

    const warningMessage = screen.getByTestId(DATA_TEST_ID.QueueItem__WarningMessage);
    expect(warningMessage).toBeVisible();
    expect(warningMessage).toHaveTextContent("2");

    await user.click(screen.getByTestId(DATA_TEST_ID.QueueItem__ViewDetailsLink));

    // the popover content portals into an antd zoom animation that never resolves under jsdom,
    // so assert on what it rendered rather than on computed visibility
    const summary = await screen.findByTestId(DATA_TEST_ID.ImportResultContent__Summary);
    expect(summary).toHaveTextContent("Matched columns");
    expect(summary).toHaveTextContent("Skipped columns");

    const table = screen.getByTestId(DATA_TEST_ID.ImportResultContent__Table);
    expect(table).toHaveTextContent("name");
    expect(table).toHaveTextContent("unknown_a");
    expect(table).toHaveTextContent("no matching schema field for header 'unknown_a'");
  });

  test("Test completed non CSV item", () => {
    renderQueueItem({
      ...baseQueue,
      fileName: "test.json",
      extension: "json",
      jobState: completedJobState,
      importResult: { ...allMatchedResult, columns: [] },
    });

    expect(screen.getByTestId(DATA_TEST_ID.Uploader__CompleteIcon)).toBeVisible();
    expect(screen.queryByTestId(DATA_TEST_ID.QueueItem__WarningIcon)).not.toBeInTheDocument();
    expect(screen.queryByTestId(DATA_TEST_ID.QueueItem__ViewDetailsLink)).not.toBeInTheDocument();
  });

  test("Test completed CSV item without an import result", () => {
    renderQueueItem({
      ...baseQueue,
      jobState: completedJobState,
      importResult: null,
    });

    expect(screen.getByTestId(DATA_TEST_ID.Uploader__CompleteIcon)).toBeVisible();
    expect(screen.queryByTestId(DATA_TEST_ID.QueueItem__WarningIcon)).not.toBeInTheDocument();
    expect(screen.queryByTestId(DATA_TEST_ID.QueueItem__ViewDetailsLink)).not.toBeInTheDocument();
  });
});
