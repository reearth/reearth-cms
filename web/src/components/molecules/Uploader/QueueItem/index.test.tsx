import type { ComponentProps, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import QueueItem from ".";
import { UploadStatus, type UploaderQueueItem } from "../types";

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
    id: "queue-1",
    status: UploadStatus.Queued,
    fileName: "test.png",
    fileContent: [],
    progress: 0,
    url: "/assets/test.png",
    error: null,
  };

  const renderQueueItem = (
    queue: UploaderQueueItem,
    props?: Partial<ComponentProps<typeof QueueItem>>,
  ) => {
    const onRetry = vi.fn();
    const onCancel = vi.fn();

    render(
      <MemoryRouter>
        <QueueItem queue={queue} onRetry={onRetry} onCancel={onCancel} {...props} />
      </MemoryRouter>,
    );

    return { onRetry, onCancel };
  };

  test("Renders completed item as a link", () => {
    renderQueueItem({ ...baseQueue, status: UploadStatus.Completed, progress: 100 });

    const link = screen.getByRole("link", { name: baseQueue.fileName });
    expect(link).toHaveAttribute("href", baseQueue.url);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  test("Shows progress and allows cancel for in-progress upload", async () => {
    const { onCancel } = renderQueueItem({
      ...baseQueue,
      status: UploadStatus.InProgress,
      progress: 42,
    });

    expect(screen.getByRole("progressbar")).toHaveAttribute("data-percent", "42");

    const cancelButton = screen.getByRole("button", { name: "closeCircle" });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledWith(baseQueue.id);
  });

  test("Shows error message and retry action for failed upload", async () => {
    const error = "Upload failed";
    const { onRetry } = renderQueueItem({
      ...baseQueue,
      status: UploadStatus.Failed,
      error,
    });

    expect(screen.getByText(error)).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: "retry" });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledWith(baseQueue.id);
  });

  test("Shows canceled message and retry action for canceled upload", async () => {
    const { onRetry } = renderQueueItem({
      ...baseQueue,
      status: UploadStatus.Canceled,
    });

    expect(screen.getByText("Upload canceled")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: "retry" });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledWith(baseQueue.id);
  });
});
