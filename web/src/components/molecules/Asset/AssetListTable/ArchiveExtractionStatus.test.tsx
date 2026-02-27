import { screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import type { ArchiveExtractionStatus as ArchiveExtractionStatusType } from "@reearth-cms/components/molecules/Asset/types";
import { render } from "@reearth-cms/test/utils";

import ArchiveExtractionStatus from "./ArchiveExtractionStatus";

vi.mock("@reearth-cms/i18n", () => ({ useT: () => (key: string) => key }));

describe("ArchiveExtractionStatus", () => {
  const cases: [ArchiveExtractionStatusType, string, string][] = [
    ["DONE", "Decompressed", "#52C41A"],
    ["FAILED", "Failed", "#F5222D"],
    ["IN_PROGRESS", "Decompressing", "#FA8C16"],
    ["SKIPPED", "Skipped", "#BFBFBF"],
    ["PENDING", "Pending", "#BFBFBF"],
  ];

  test.each(cases)("%s renders badge with correct text and color", (status, expectedText, expectedColor) => {
    const { container } = render(<ArchiveExtractionStatus archiveExtractionStatus={status} />);
    expect(screen.getByText(expectedText)).toBeInTheDocument();
    const dot = container.querySelector<HTMLElement>(".ant-badge-status-dot");
    expect(dot).toHaveStyle({ background: expectedColor });
  });

  test("unknown status renders badge with no color and no text", () => {
    const { container } = render(
      <ArchiveExtractionStatus archiveExtractionStatus={"UNKNOWN" as ArchiveExtractionStatusType} />,
    );
    expect(container.querySelector(".ant-badge-status-text")).not.toBeInTheDocument();
    const dot = container.querySelector<HTMLElement>(".ant-badge-status-dot");
    expect(dot).toBeInTheDocument();
    expect(dot).not.toHaveAttribute("style");
  });
});
