import { screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Request } from "@reearth-cms/components/molecules/Request/types";
import { render, userEvent } from "@reearth-cms/test/utils";

import LinkItemRequestModal from "./LinkItemRequestModal";

vi.mock("@reearth-cms/i18n", () => ({ useT: () => (key: string) => key }));
vi.mock("@reearth-cms/utils/format", () => ({
  dateTimeFormat: (date?: Date | string) => (date ? String(date) : ""),
}));
vi.mock("@reearth-cms/components/atoms/Badge", () => ({
  default: ({ color, text }: { color: string; text: string }) => (
    <span data-testid="badge" data-color={color}>
      {text}
    </span>
  ),
}));
vi.mock("@reearth-cms/components/atoms/Radio", () => {
  const RadioComponent = ({ value, children }: { value?: string; children?: React.ReactNode }) => (
    <span data-testid={`radio-${value}`}>{children}</span>
  );
  const Group = ({
    onChange,
    value,
    children,
  }: {
    onChange?: (e: { target: { value: string } }) => void;
    value?: string;
    children?: React.ReactNode;
  }) => (
    <span
      data-testid="radio-group"
      data-value={value}
      onClick={() => onChange?.({ target: { value: value ?? "" } })}>
      {children}
    </span>
  );
  RadioComponent.Group = Group;
  return { default: RadioComponent };
});
vi.mock("@reearth-cms/components/molecules/Common/ResizableProTable", () => ({
  default: ({
    dataSource,
    columns,
    toolbar,
    onChange,
  }: {
    dataSource?: Record<string, unknown>[];
    columns?: {
      title: string;
      dataIndex?: string | string[];
      render?: (text: unknown, record: Record<string, unknown>) => React.ReactNode;
    }[];
    toolbar?: { search?: React.ReactNode };
    onChange?: (pagination: { current?: number; pageSize?: number }) => void;
  }) => (
    <div data-testid="resizable-pro-table">
      {toolbar?.search}
      <table>
        <tbody>
          {dataSource?.map((record, rowIdx) => (
            <tr key={rowIdx} data-testid={`table-row-${rowIdx}`}>
              {columns?.map((col, colIdx) => (
                <td key={colIdx}>
                  {col.render
                    ? col.render(
                        Array.isArray(col.dataIndex)
                          ? col.dataIndex.reduce(
                              (obj: Record<string, unknown>, key: string) =>
                                (obj?.[key] as Record<string, unknown>) ?? undefined,
                              record,
                            )
                          : col.dataIndex
                            ? record[col.dataIndex]
                            : undefined,
                        record,
                      )
                    : Array.isArray(col.dataIndex)
                      ? String(
                          col.dataIndex.reduce(
                            (obj: Record<string, unknown>, key: string) =>
                              (obj?.[key] as Record<string, unknown>) ?? undefined,
                            record,
                          ) ?? "",
                        )
                      : col.dataIndex
                        ? String(record[col.dataIndex] ?? "")
                        : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        data-testid="trigger-table-change"
        onClick={() => onChange?.({ current: 2, pageSize: 20 })}>
        change
      </button>
    </div>
  ),
}));

type Props = React.ComponentProps<typeof LinkItemRequestModal>;

const createRequest = (overrides?: Partial<Request>): Request => ({
  id: "req-1",
  title: "Test Request",
  description: "",
  state: "WAITING",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  comments: [],
  items: [],
  createdBy: { id: "u1", name: "Test User", email: "test@example.com" },
  reviewers: [{ id: "r1", name: "Reviewer One", email: "r1@example.com" }],
  ...overrides,
});

const defaultProps: Props = {
  items: [{ itemId: "item-1" }],
  visible: true,
  onLinkItemRequestModalCancel: vi.fn(),
  requestModalLoading: false,
  requestModalTotalCount: 1,
  requestModalPage: 1,
  requestModalPageSize: 10,
  onRequestTableChange: vi.fn(),
  requestList: [createRequest()],
  onChange: vi.fn(),
  onRequestSearchTerm: vi.fn(),
  onRequestTableReload: vi.fn(),
};

describe("LinkItemRequestModal", () => {
  test("renders modal with title when visible", () => {
    render(<LinkItemRequestModal {...defaultProps} />);
    expect(screen.getByText("Add to Request")).toBeInTheDocument();
  });

  test("does not render table content when hidden", () => {
    render(<LinkItemRequestModal {...defaultProps} visible={false} />);
    expect(screen.queryByTestId("resizable-pro-table")).not.toBeInTheDocument();
  });

  test("renders request data in table", () => {
    render(
      <LinkItemRequestModal
        {...defaultProps}
        requestList={[
          createRequest({
            title: "My Request",
            state: "WAITING",
            createdBy: { id: "u2", name: "Alice", email: "alice@example.com" },
            reviewers: [{ id: "r2", name: "Bob", email: "bob@example.com" }],
            createdAt: new Date("2024-06-15T12:00:00Z"),
          }),
        ]}
      />,
    );
    expect(screen.getByText("My Request")).toBeInTheDocument();
    expect(screen.getByText("WAITING")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  test("renders multiple requests as table rows", () => {
    const requests = [
      createRequest({ id: "r1", title: "Request 1" }),
      createRequest({ id: "r2", title: "Request 2" }),
      createRequest({ id: "r3", title: "Request 3" }),
    ];
    render(<LinkItemRequestModal {...defaultProps} requestList={requests} />);
    const rows = screen.getAllByTestId(/^table-row-/);
    expect(rows).toHaveLength(3);
  });

  test("badge shows correct color per state", () => {
    render(
      <LinkItemRequestModal
        {...defaultProps}
        requestList={[
          createRequest({ id: "r1", state: "WAITING" }),
          createRequest({ id: "r2", state: "APPROVED" }),
        ]}
      />,
    );
    const badges = screen.getAllByTestId("badge");
    expect(badges[0]).toHaveAttribute("data-color", "#FA8C16");
    expect(badges[1]).toHaveAttribute("data-color", "#52C41A");
  });

  test("radio selection enables OK button", async () => {
    const user = userEvent.setup();
    render(<LinkItemRequestModal {...defaultProps} />);
    const okButton = screen.getByRole("button", { name: "OK" });
    expect(okButton).toBeDisabled();
    const radioGroup = screen.getByTestId("radio-group");
    await user.click(radioGroup);
    expect(okButton).not.toBeDisabled();
  });

  test("search calls onRequestSearchTerm", async () => {
    const onRequestSearchTerm = vi.fn();
    const user = userEvent.setup();
    render(<LinkItemRequestModal {...defaultProps} onRequestSearchTerm={onRequestSearchTerm} />);
    const searchInput = screen.getByPlaceholderText("input search text");
    await user.type(searchInput, "test query{Enter}");
    expect(onRequestSearchTerm).toHaveBeenCalledWith(
      "test query",
      expect.anything(),
      expect.anything(),
    );
  });

  test("table change calls onRequestTableChange", () => {
    const onRequestTableChange = vi.fn();
    render(<LinkItemRequestModal {...defaultProps} onRequestTableChange={onRequestTableChange} />);
    screen.getByTestId("trigger-table-change").click();
    expect(onRequestTableChange).toHaveBeenCalledWith(2, 20);
  });

  test("OK button is disabled initially", () => {
    render(<LinkItemRequestModal {...defaultProps} />);
    const okButton = screen.getByRole("button", { name: "OK" });
    expect(okButton).toBeDisabled();
  });

  test("cancel button calls onLinkItemRequestModalCancel", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<LinkItemRequestModal {...defaultProps} onLinkItemRequestModalCancel={onCancel} />);
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);
    expect(onCancel).toHaveBeenCalled();
  });

  test("handles request with no createdBy", () => {
    render(
      <LinkItemRequestModal
        {...defaultProps}
        requestList={[createRequest({ createdBy: undefined })]}
      />,
    );
    expect(screen.getByTestId("table-row-0")).toBeInTheDocument();
  });

  test("handles empty reviewers array", () => {
    render(
      <LinkItemRequestModal {...defaultProps} requestList={[createRequest({ reviewers: [] })]} />,
    );
    expect(screen.getByTestId("table-row-0")).toBeInTheDocument();
  });
});
