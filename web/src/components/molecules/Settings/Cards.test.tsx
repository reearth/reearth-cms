import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Resource } from "@reearth-cms/components/molecules/Workspace/types";

import Cards from "./Cards";

describe("Cards", () => {
  const user = userEvent.setup();

  const resources: Resource[] = [
    {
      id: "",
      props: {
        image: "",
        name: "",
        url: "",
      },
      type: "DEFAULT",
    },
  ];
  const hasUpdateRight = true;
  const isTile = true;
  const handleDragEnd = () => {};

  test("Multiple cards are displayed successfully", async () => {
    const openMock = vi.fn();
    const deleteMock = vi.fn();

    render(
      <Cards
        hasUpdateRight={hasUpdateRight}
        isTile={isTile}
        onDelete={deleteMock}
        onDragEnd={handleDragEnd}
        onModalOpen={openMock}
        resources={[
          {
            id: "",
            props: {
              image: "",
              name: "",
              url: "",
            },
            type: "DEFAULT",
          },
          {
            id: "",
            props: {
              image: "",
              name: "",
              url: "",
            },
            type: "DEFAULT",
          },
        ]}
      />,
    );

    expect(screen.getAllByText("DEFAULT").length).toBe(2);
    expect(screen.getAllByLabelText("menu")[0]).toBeVisible();

    await user.click(screen.getAllByLabelText("edit")[0]);
    expect(openMock).toHaveBeenCalled();

    await user.click(screen.getAllByLabelText("delete")[0]);
    expect(deleteMock).toHaveBeenCalled();
  });

  test("Actions are correctly disabled based on user right", async () => {
    const openMock = vi.fn();
    const deleteMock = vi.fn();

    render(
      <Cards
        hasUpdateRight={false}
        isTile={isTile}
        onDelete={deleteMock}
        onDragEnd={handleDragEnd}
        onModalOpen={openMock}
        resources={resources}
      />,
    );

    expect(screen.queryByLabelText("menu")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("edit"));
    expect(openMock).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText("delete"));
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
