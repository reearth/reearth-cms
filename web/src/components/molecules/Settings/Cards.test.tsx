import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import { Resource } from "@reearth-cms/components/molecules/Workspace/types";

import Cards from "./Cards";

describe("Cards", () => {
  const user = userEvent.setup();

  const resources: Resource[] = [
    {
      id: "",
      type: "DEFAULT",
      props: {
        image: "",
        name: "",
        url: "",
      },
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
        resources={[
          {
            id: "",
            type: "DEFAULT",
            props: {
              image: "",
              name: "",
              url: "",
            },
          },
          {
            id: "",
            type: "DEFAULT",
            props: {
              image: "",
              name: "",
              url: "",
            },
          },
        ]}
        onModalOpen={openMock}
        isTile={isTile}
        onDelete={deleteMock}
        onDragEnd={handleDragEnd}
        hasUpdateRight={hasUpdateRight}
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
        resources={resources}
        onModalOpen={openMock}
        isTile={isTile}
        onDelete={deleteMock}
        onDragEnd={handleDragEnd}
        hasUpdateRight={false}
      />,
    );

    expect(screen.queryByLabelText("menu")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("edit"));
    expect(openMock).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText("delete"));
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
