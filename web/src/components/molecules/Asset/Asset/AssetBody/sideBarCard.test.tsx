import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { render } from "@reearth-cms/test/utils";

import SideBarCard from "./sideBarCard";

describe("SideBarCard", () => {
  test("renders title", () => {
    render(<SideBarCard title="Info Section" />);
    expect(screen.getByText("Info Section")).toBeInTheDocument();
  });

  test("renders title and children", () => {
    render(
      <SideBarCard title="Details">
        <span>Child content</span>
      </SideBarCard>,
    );
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });
});
