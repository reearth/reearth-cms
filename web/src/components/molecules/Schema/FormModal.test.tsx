import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, test, expect, vi, afterEach } from "vitest";

import { keyAutoFill, keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
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

const editData = {
  id: "m1",
  name: "MyModel",
  description: "desc",
  key: "my-model",
  schemaId: "s1",
  schema: { id: "s1", fields: [] },
  metadataSchema: { id: "ms1", fields: [] },
} as Model;

describe("FormModal", () => {
  const user = userEvent.setup();

  afterEach(() => {
    vi.clearAllMocks();
  });

  const fillFormAndWaitForOk = async (name: string, key: string) => {
    await user.type(screen.getByLabelText("Model name"), name);
    await user.type(screen.getByLabelText("Model key"), key);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).not.toBeDisabled();
    });
  };

  test("renders create mode title for model", () => {
    render(<FormModal {...defaultProps} isModel={true} data={undefined} />);
    expect(screen.getByText("New Model")).toBeInTheDocument();
  });

  test("renders create mode title for group", () => {
    render(<FormModal {...defaultProps} isModel={false} data={undefined} />);
    expect(screen.getByText("New Group")).toBeInTheDocument();
  });

  test("renders edit mode title for model", () => {
    render(<FormModal {...defaultProps} isModel={true} data={editData} />);
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

  test("calls keyAutoFill when name changes in create mode", async () => {
    render(<FormModal {...defaultProps} data={undefined} />);
    await user.type(screen.getByLabelText("Model name"), "a");
    expect(keyAutoFill).toHaveBeenCalled();
  });

  test("does not call keyAutoFill when name changes in edit mode", async () => {
    render(<FormModal {...defaultProps} data={editData} />);
    await user.clear(screen.getByLabelText("Model name"));
    await user.type(screen.getByLabelText("Model name"), "New");
    expect(keyAutoFill).not.toHaveBeenCalled();
  });

  test("calls keyReplace when key input changes", async () => {
    render(<FormModal {...defaultProps} />);
    await user.type(screen.getByLabelText("Model key"), "a");
    expect(keyReplace).toHaveBeenCalled();
  });

  test("calls onCreate with form values on submit (create)", async () => {
    const onCreateMock = vi.fn().mockResolvedValue(undefined);
    render(<FormModal {...defaultProps} onCreate={onCreateMock} />);

    await fillFormAndWaitForOk("TestModel", "test-model");
    await user.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(onCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: "TestModel", key: "test-model" }),
      );
    });
  });

  test("calls onUpdate with id + form values on submit (edit)", async () => {
    const onUpdateMock = vi.fn().mockResolvedValue(undefined);
    render(<FormModal {...defaultProps} data={editData} onUpdate={onUpdateMock} />);

    const nameInput = screen.getByLabelText("Model name");
    await user.clear(nameInput);
    await user.type(nameInput, "UpdatedModel");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).not.toBeDisabled();
    });
    await user.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(onUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({ id: "m1", name: "UpdatedModel", key: "my-model" }),
      );
    });
  });

  test("re-enables OK when onKeyCheck rejects during submit", async () => {
    const onKeyCheckMock = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error("duplicate"));
    render(<FormModal {...defaultProps} onKeyCheck={onKeyCheckMock} />);

    await fillFormAndWaitForOk("TestModel", "test-model");
    await user.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).not.toBeDisabled();
    });
  });

  test("enables OK button after filling valid name and key", async () => {
    render(<FormModal {...defaultProps} />);

    expect(screen.getByRole("button", { name: "OK" })).toBeDisabled();

    await user.type(screen.getByLabelText("Model name"), "ValidModel");
    await user.type(screen.getByLabelText("Model key"), "valid-model");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).not.toBeDisabled();
    });
  });

  test("keeps OK disabled when values match original data (edit)", () => {
    render(<FormModal {...defaultProps} data={editData} />);
    expect(screen.getByDisplayValue("MyModel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OK" })).toBeDisabled();
  });

  test("disables both buttons while submit is in progress", async () => {
    const onCreateMock = vi.fn(() => new Promise<void>(() => {}));
    render(<FormModal {...defaultProps} onCreate={onCreateMock} />);

    await fillFormAndWaitForOk("TestModel", "test-model");
    await user.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(onCreateMock).toHaveBeenCalled();
    });
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  test("does not call onKeyCheck again for same key", async () => {
    const onKeyCheckMock = vi.fn().mockResolvedValue(true);
    render(<FormModal {...defaultProps} onKeyCheck={onKeyCheckMock} />);

    await user.type(screen.getByLabelText("Model name"), "abc");
    await user.type(screen.getByLabelText("Model key"), "abc");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).not.toBeDisabled();
    });

    const callCountAfterFirstValidation = onKeyCheckMock.mock.calls.length;

    await user.type(screen.getByLabelText("Model name"), "d");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "OK" })).not.toBeDisabled();
    });

    expect(onKeyCheckMock).toHaveBeenCalledTimes(callCountAfterFirstValidation);
  });

  test("resets form fields after successful submit + reopen", async () => {
    const onCreateMock = vi.fn().mockResolvedValue(undefined);
    const Wrapper = () => {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button data-testid="reopen" onClick={() => setOpen(true)}>
            reopen
          </button>
          <FormModal
            {...defaultProps}
            open={open}
            onClose={() => setOpen(false)}
            onCreate={onCreateMock}
          />
        </>
      );
    };
    render(<Wrapper />);

    await fillFormAndWaitForOk("TestModel", "test-model");
    await user.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(onCreateMock).toHaveBeenCalled();
    });

    await user.click(screen.getByTestId("reopen"));

    await waitFor(() => {
      expect(screen.getByLabelText("Model name")).toHaveValue("");
    });
    expect(screen.getByLabelText("Model key")).toHaveValue("");
  });
});
