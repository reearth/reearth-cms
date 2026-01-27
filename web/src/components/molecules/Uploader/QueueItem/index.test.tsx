import type { ComponentProps, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import QueueItem from ".";
import { type UploaderQueueItem } from "../types";
import { JobStatus, JobType } from "@reearth-cms/gql/__generated__/graphql.generated";
import { createMockRcFile } from "@reearth-cms/e2e/helpers/mock.helper";

vi.mock("@reearth-cms/i18n", () => ({
  useT: () => (key: string) => key,
}));

vi.mock("@reearth-cms/components/atoms/Tooltip", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@reearth-cms/components/atoms/Progress", () => ({
  default: ({ percent }: { percent?: number }) => <div role="progressbar" data-percent={percent} />,
}));

vi.mock("@reearth-cms/components/atoms/Icon", () => ({
  default: ({ icon, onClick, className, ...rest }: any) => {
    const Element = onClick ? "button" : "span";
    return (
      <Element
        aria-label={icon}
        data-icon={icon}
        onClick={onClick}
        className={className}
        {...rest}
      />
    );
  },
}));

describe("QueueItem component test", () => {
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
    const onRetry = vi.fn();
    const onCancel = vi.fn();
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

  test("Renders completed item as a link", () => {
    renderQueueItem({ ...baseQueue, jobStatus: JobStatus.Completed });

    const link = screen.getByRole("link", { name: baseQueue.fileName });
    expect(link).toHaveAttribute("href", baseQueue.url);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  test("Shows progress and allows cancel for in-progress upload", async () => {
    const { onCancel } = renderQueueItem({
      ...baseQueue,
      jobStatus: JobStatus.InProgress,
      jobProgress: {
        percentage: 42,
        processed: 42,
        total: 100,
      },
    });

    expect(screen.getByRole("progressbar")).toHaveAttribute("data-percent", "42");

    const cancelButton = screen.getByRole("button", { name: "closeCircle" });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledWith(baseQueue.jobId);
  });

  test("Shows retry action for failed upload", async () => {
    const { onRetry } = renderQueueItem({
      ...baseQueue,
      jobStatus: JobStatus.Failed,
    });

    const retryButton = screen.getByRole("button", { name: "retry" });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledWith(baseQueue.jobId);
  });

  test("Shows retry action for canceled upload", async () => {
    const { onRetry } = renderQueueItem({
      ...baseQueue,
      jobStatus: JobStatus.Cancelled,
    });

    const retryButton = screen.getByRole("button", { name: "retry" });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledWith(baseQueue.jobId);
  });
});
