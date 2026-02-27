import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { describe, test, expect, vi } from "vitest";

import type { VersionedItem } from "@reearth-cms/components/molecules/Content/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import Versions from "./Versions";

dayjs.extend(utc);

const makeVersion = (overrides?: Partial<VersionedItem>): VersionedItem => ({
  version: "1",
  status: "DRAFT",
  timestamp: new Date("2024-06-10T08:00:00Z"),
  creator: { name: "Alice" },
  fields: [],
  requests: [],
  ...overrides,
});

const defaultProps = () => ({
  versionClick: vi.fn(),
  onNavigateToRequest: vi.fn(),
});

describe("Versions", () => {
  test("renders formatted timestamp", () => {
    const version = makeVersion();
    render(<Versions versions={[version]} {...defaultProps()} />);
    const expected = dateTimeFormat(version.timestamp, "YYYY/MM/DD, HH:mm");
    expect(screen.getByText(expected)).toBeVisible();
  });

  test("shows 'current' tag on first version only", () => {
    const versions = [makeVersion({ version: "2" }), makeVersion({ version: "1" })];
    render(<Versions versions={versions} {...defaultProps()} />);
    const currentTags = screen.getAllByText("current");
    expect(currentTags).toHaveLength(1);
  });

  test("shows 'Created by' for last version and 'Updated by' for others", () => {
    const versions = [
      makeVersion({ version: "2", creator: { name: "Bob" } }),
      makeVersion({ version: "1", creator: { name: "Alice" } }),
    ];
    render(<Versions versions={versions} {...defaultProps()} />);
    expect(screen.getByText("Updated by Bob")).toBeVisible();
    expect(screen.getByText("Created by Alice")).toBeVisible();
  });

  test("shows 'Created by' when there is only one version", () => {
    render(<Versions versions={[makeVersion()]} {...defaultProps()} />);
    expect(screen.getByText("Created by Alice")).toBeVisible();
  });

  test("renders request links only for REVIEW status versions", () => {
    const versions = [
      makeVersion({
        version: "2",
        status: "REVIEW",
        requests: [{ id: "req-1", title: "Review Request" }],
      }),
      makeVersion({
        version: "1",
        status: "DRAFT",
        requests: [{ id: "req-2", title: "Draft Request" }],
      }),
    ];
    render(<Versions versions={versions} {...defaultProps()} />);
    expect(screen.getByText("Review Request")).toBeVisible();
    expect(screen.queryByText("Draft Request")).not.toBeInTheDocument();
  });

  test("calls versionClick when clicking a version card title", async () => {
    const user = userEvent.setup();
    const props = defaultProps();
    const version = makeVersion();
    render(<Versions versions={[version]} {...props} />);
    const timestamp = dateTimeFormat(version.timestamp, "YYYY/MM/DD, HH:mm");
    await user.click(screen.getByText(timestamp));
    expect(props.versionClick).toHaveBeenCalledWith(version);
  });

  test("calls onNavigateToRequest when clicking a request link", async () => {
    const user = userEvent.setup();
    const props = defaultProps();
    const version = makeVersion({
      status: "REVIEW",
      requests: [{ id: "req-1", title: "My Request" }],
    });
    render(<Versions versions={[version]} {...props} />);
    await user.click(screen.getByText("My Request"));
    expect(props.onNavigateToRequest).toHaveBeenCalledWith("req-1");
  });

  test("renders Versions__RequestStatus badge", () => {
    render(<Versions versions={[makeVersion({ status: "DRAFT" })]} {...defaultProps()} />);
    expect(screen.getByTestId(DATA_TEST_ID.Versions__RequestStatus)).toBeInTheDocument();
  });

  test("renders nothing for empty versions array", () => {
    const { container } = render(<Versions versions={[]} {...defaultProps()} />);
    expect(container.textContent).toBe("");
  });
});
