import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import ViewFormModal from ".";

type Props = React.ComponentProps<typeof ViewFormModal>;

const DEFAULT_PROPS: Props = {
  currentView: { id: "view-1", name: "Default View" },
  open: true,
  modalState: "create",
  submitting: false,
  onClose: vi.fn(),
  onCreate: vi.fn(),
  OnUpdate: vi.fn(),
};

function renderModal(overrides: Partial<Props> = {}) {
  return render(<ViewFormModal {...DEFAULT_PROPS} {...overrides} />);
}

describe("ViewFormModal", () => {
  test("renders modal with name input in create mode", () => {
    renderModal();
    expect(screen.getByText("New View")).toBeInTheDocument();
    expect(screen.getByLabelText("View Name")).toBeInTheDocument();
  });

  test("renders modal with 'Update View' title in rename mode", () => {
    renderModal({ modalState: "rename" });
    expect(screen.getByText("Update View")).toBeInTheDocument();
  });

  test("OK button is disabled when name input is empty", () => {
    renderModal();
    expect(screen.getByRole("button", { name: "OK" })).toBeDisabled();
  });

  test("OK button becomes enabled when name has value", async () => {
    renderModal();
    const input = screen.getByLabelText("View Name");
    await userEvent.type(input, "My View");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).toBeEnabled();
    });
  });

  test("calls onCreate with view name on submit", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    renderModal({ onCreate, onClose });

    const input = screen.getByLabelText("View Name");
    await userEvent.type(input, "My View");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).toBeEnabled();
    });
    await userEvent.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith("My View");
    });
  });

  test("calls onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });

  test("pre-fills name when renaming existing view", () => {
    renderModal({
      modalState: "rename",
      currentView: { id: "view-1", name: "Existing View" },
    });
    expect(screen.getByLabelText("View Name")).toHaveValue("Existing View");
  });

  test("calls OnUpdate with viewId and name on rename submit", async () => {
    const OnUpdate = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    renderModal({
      modalState: "rename",
      currentView: { id: "view-1", name: "Old Name" },
      OnUpdate,
      onClose,
    });

    const input = screen.getByLabelText("View Name");
    await userEvent.clear(input);
    await userEvent.type(input, "New Name");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).toBeEnabled();
    });
    await userEvent.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(OnUpdate).toHaveBeenCalledWith("view-1", "New Name");
    });
  });

  test("Cancel button is disabled when submitting", () => {
    renderModal({ submitting: true });
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  test("OK button stays disabled when renamed to same name", async () => {
    renderModal({
      modalState: "rename",
      currentView: { id: "view-1", name: "Same Name" },
    });

    const input = screen.getByLabelText("View Name");
    await userEvent.clear(input);
    await userEvent.type(input, "Same Name");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).toBeDisabled();
    });
  });
});
