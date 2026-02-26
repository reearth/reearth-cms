import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import ModelListHeader from "./ModelListHeader";

describe("ModelListHeader", () => {
  test("renders title text when expanded", () => {
    render(<ModelListHeader title="MODELS" collapsed={false} titleIcon="model" />);
    expect(screen.getByText("MODELS")).toBeVisible();
  });

  test("hides title when collapsed and renders icon", () => {
    render(<ModelListHeader title="MODELS" collapsed titleIcon="model" />);
    expect(screen.queryByText("MODELS")).not.toBeInTheDocument();
  });
});
