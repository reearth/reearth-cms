import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

vi.mock("@reearth-cms/i18n", () => ({
  useT: () => (key: string) => key,
}));

import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import LocalTab from "./localTab";

describe("LocalTab", () => {
  test("renders dragger wrapper with data-testid", () => {
    render(<LocalTab uploadProps={{}} />);
    expect(screen.getByTestId(DATA_TEST_ID.UploadModal__LocalTabDragger)).toBeInTheDocument();
  });

  test("renders drag-and-drop instruction text", () => {
    render(<LocalTab uploadProps={{}} />);
    expect(
      screen.getByText("Click or drag files to this area to upload"),
    ).toBeInTheDocument();
  });

  test("shows multiple-file hint when uploadProps.multiple is true", () => {
    render(<LocalTab uploadProps={{ multiple: true }} />);
    expect(
      screen.getByText("Single or multiple file upload is supported"),
    ).toBeInTheDocument();
  });

  test("shows single-file hint when uploadProps.multiple is false", () => {
    render(<LocalTab uploadProps={{ multiple: false }} />);
    expect(screen.getByText("Only single file upload is supported")).toBeInTheDocument();
  });

  test("shows single-file hint when multiple is undefined", () => {
    render(<LocalTab uploadProps={{}} />);
    expect(screen.getByText("Only single file upload is supported")).toBeInTheDocument();
  });

  test("renders alert from alertList", () => {
    render(
      <LocalTab
        uploadProps={{}}
        alertList={[{ message: "File too large", type: "error" }]}
      />,
    );
    expect(screen.getByText("File too large")).toBeInTheDocument();
  });

  test("renders multiple alerts", () => {
    render(
      <LocalTab
        uploadProps={{}}
        alertList={[
          { message: "File too large", type: "error" },
          { message: "Invalid format", type: "warning" },
        ]}
      />,
    );
    expect(screen.getByText("File too large")).toBeInTheDocument();
    expect(screen.getByText("Invalid format")).toBeInTheDocument();
  });

  test("renders no alerts when alertList is empty", () => {
    render(<LocalTab uploadProps={{}} alertList={[]} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("alert click does not propagate to parent", async () => {
    const user = userEvent.setup();
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <LocalTab
          uploadProps={{}}
          alertList={[{ message: "Size limit", type: "warning" }]}
        />
      </div>,
    );
    await user.click(screen.getByText("Size limit"));
    expect(parentClick).not.toHaveBeenCalled();
  });

  test("forwards uploadProps to Dragger", () => {
    render(<LocalTab uploadProps={{ accept: ".png,.jpg" }} />);
    const input = screen
      .getByTestId(DATA_TEST_ID.UploadModal__LocalTabDragger)
      .querySelector("input[type='file']");
    expect(input).toHaveAttribute("accept", ".png,.jpg");
  });
});
