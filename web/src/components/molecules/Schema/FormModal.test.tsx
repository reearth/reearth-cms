import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import type { Model } from "@reearth-cms/components/molecules/Model/types";

import FormModal from "./FormModal";
import type { Group } from "./types";

vi.mock("@reearth-cms/components/molecules/Common/Form/utils", () => ({
  keyAutoFill: vi.fn(),
  keyReplace: vi.fn(),
}));

const defaultProps = {
  data: undefined as Model | Group | undefined,
  open: true,
  onClose: vi.fn(),
  onCreate: vi.fn(),
  onUpdate: vi.fn(),
  onKeyCheck: vi.fn().mockResolvedValue(true),
  isModel: true,
};

describe("FormModal", () => {
  const user = userEvent.setup();

  test("renders create mode title for model", () => {
    render(<FormModal {...defaultProps} isModel={true} data={undefined} />);
    expect(screen.getByText("New Model")).toBeInTheDocument();
  });

  test("renders create mode title for group", () => {
    render(<FormModal {...defaultProps} isModel={false} data={undefined} />);
    expect(screen.getByText("New Group")).toBeInTheDocument();
  });

  test("renders edit mode title for model", () => {
    const data = {
      id: "m1",
      name: "MyModel",
      description: "desc",
      key: "my-model",
      schemaId: "s1",
      schema: { id: "s1", fields: [] },
      metadataSchema: { id: "ms1", fields: [] },
    } as Model;
    render(<FormModal {...defaultProps} isModel={true} data={data} />);
    expect(screen.getByText("Update Model")).toBeInTheDocument();
  });

  test("renders edit mode title for group", () => {
    const data = {
      id: "g1",
      name: "MyGroup",
      description: "desc",
      key: "my-group",
      schemaId: "s1",
      projectId: "p1",
      schema: { id: "s1", fields: [] },
      order: 0,
    } as Group;
    render(<FormModal {...defaultProps} isModel={false} data={data} />);
    expect(screen.getByText("Update Group")).toBeInTheDocument();
  });

  test("shows model-specific labels when isModel is true", () => {
    render(<FormModal {...defaultProps} isModel={true} />);
    expect(screen.getByText("Model name")).toBeInTheDocument();
    expect(screen.getByText("Model description")).toBeInTheDocument();
    expect(screen.getByText("Model key")).toBeInTheDocument();
  });

  test("shows group-specific labels when isModel is false", () => {
    render(<FormModal {...defaultProps} isModel={false} />);
    expect(screen.getByText("Group name")).toBeInTheDocument();
    expect(screen.getByText("Group description")).toBeInTheDocument();
    expect(screen.getByText("Group key")).toBeInTheDocument();
  });

  test("OK button is initially disabled", () => {
    render(<FormModal {...defaultProps} />);
    expect(screen.getByText("OK").closest("button")).toBeDisabled();
  });

  test("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    render(<FormModal {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("does not render modal content when open is false", () => {
    render(<FormModal {...defaultProps} open={false} />);
    expect(screen.queryByText("New Model")).not.toBeInTheDocument();
  });

  test("shows model key extra message for model", () => {
    render(<FormModal {...defaultProps} isModel={true} />);
    expect(
      screen.getByText(
        "Model key must be unique and at least 3 characters long. It can only contain letters, numbers, underscores, and dashes.",
      ),
    ).toBeInTheDocument();
  });

  test("shows group key extra message for group", () => {
    render(<FormModal {...defaultProps} isModel={false} />);
    expect(
      screen.getByText(
        "Group key must be unique and at least 3 characters long. It can only contain letters, numbers, underscores, and dashes.",
      ),
    ).toBeInTheDocument();
  });

  test("populates form fields in edit mode", () => {
    const data = {
      id: "m1",
      name: "MyModel",
      description: "A description",
      key: "my-model",
      schemaId: "s1",
      schema: { id: "s1", fields: [] },
      metadataSchema: { id: "ms1", fields: [] },
    } as Model;
    render(<FormModal {...defaultProps} data={data} />);
    expect(screen.getByDisplayValue("MyModel")).toBeInTheDocument();
    expect(screen.getByDisplayValue("A description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("my-model")).toBeInTheDocument();
  });
});
