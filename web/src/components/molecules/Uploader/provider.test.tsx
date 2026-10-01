import { MockedProvider } from "@apollo/client/testing/react";
import type { RenderResult } from "@testing-library/react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider as JotaiProvider } from "jotai";
import { useEffect, useRef } from "react";
import { describe, expect, test } from "vitest";

import type { ImportJobResult } from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  ImportColumnStatus,
  JobStatus,
  JobType,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import { JobDocument } from "@reearth-cms/gql/__generated__/job.generated";
import { useUploader } from "@reearth-cms/state";
import { Test } from "@reearth-cms/test/utils";

import useUploaderHook from "./hooks";
import { UploaderProvider } from "./provider";
import type { UploaderQueueItem } from "./types";

const JOB_ID = "job-1";

const importResult: ImportJobResult = {
  total: 100,
  inserted: 80,
  updated: 20,
  ignored: 0,
  columns: [
    { header: "name", status: ImportColumnStatus.Matched, schemaFieldKey: "name", reason: null },
    {
      header: "unknown",
      status: ImportColumnStatus.Skipped,
      schemaFieldKey: null,
      reason: "no matching schema field for header 'unknown'",
    },
  ],
};

const queueItem: UploaderQueueItem = {
  jobId: JOB_ID,
  jobState: { status: JobStatus.InProgress, progress: null },
  fileName: "test.csv",
  extension: "csv",
  url: "/assets/test.csv",
  file: Test.createMockRcFile({ name: "test.csv" }),
  workspaceId: "workspace-1",
  projectId: "project-1",
  modelId: "model-1",
};

const jobMock = (result: ImportJobResult | null) => ({
  request: { query: JobDocument, variables: { jobId: JOB_ID } },
  result: {
    data: {
      job: {
        __typename: "Job" as const,
        id: JOB_ID,
        type: JobType.Import,
        status: JobStatus.Completed,
        projectId: "project-1",
        progress: {
          __typename: "JobProgress" as const,
          processed: 100,
          total: 100,
          percentage: 100,
        },
        error: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        importResult: result && { __typename: "ImportJobResult" as const, ...result },
      },
    },
  },
});

// seeds the queue, then reports the completed job so the provider re-queries it
const Harness: React.FC = () => {
  const [uploaderState, setUploaderState] = useUploader();
  const { handleJobUpdate } = useUploaderHook();
  const hasReported = useRef(false);

  useEffect(() => {
    setUploaderState(prev => ({ ...prev, queue: [queueItem] }));
  }, [setUploaderState]);

  useEffect(() => {
    if (hasReported.current || uploaderState.queue.length === 0) return;
    hasReported.current = true;

    handleJobUpdate({
      jobId: JOB_ID,
      jobState: { status: JobStatus.Completed, progress: null },
    });
  }, [handleJobUpdate, uploaderState.queue.length]);

  const item = uploaderState.queue.at(0);

  // undefined means the re-query has not landed yet, null means it landed with no result
  const content =
    item === undefined
      ? "no-item"
      : item.importResult === undefined
        ? "pending"
        : item.importResult === null
          ? "null-result"
          : JSON.stringify(item.importResult.columns);

  return <div data-testid="harness">{content}</div>;
};

const renderProvider = (mocks: ReturnType<typeof jobMock>[]): RenderResult =>
  render(
    <JotaiProvider>
      <MockedProvider mocks={mocks}>
        <UploaderProvider>
          <Harness />
        </UploaderProvider>
      </MockedProvider>
    </JotaiProvider>,
  );

describe("Test UploaderProvider import result", () => {
  test("Test a completed job merging its import result into the queue", async () => {
    renderProvider([jobMock(importResult)]);

    await waitFor(() =>
      expect(screen.getByTestId("harness")).toHaveTextContent(
        "no matching schema field for header 'unknown'",
      ),
    );
    expect(screen.getByTestId("harness")).toHaveTextContent("name");
  });

  test("Test a completed job without an import result", async () => {
    renderProvider([jobMock(null)]);

    await waitFor(() => expect(screen.getByTestId("harness")).toHaveTextContent("null-result"));
  });
});
