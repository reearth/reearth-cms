import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import ModelListHeader from "./ModelListHeader";

describe("ModelListHeader", () => {
  test("renders title text when expanded", () => {
    render(<ModelListHeader title="MODELS" collapsed={false} titleIcon="table" />);
    expect(screen.getByText("MODELS")).toBeVisible();
  });

  test("hides title when collapsed and renders icon", () => {
    render(<ModelListHeader title="MODELS" collapsed titleIcon="table" />);
    expect(screen.queryByText("MODELS")).not.toBeInTheDocument();
  });
});
