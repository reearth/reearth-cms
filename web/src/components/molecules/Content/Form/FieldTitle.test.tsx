import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import FieldTitle from "./FieldTitle";

describe("FieldTitle", () => {
  test("renders title text", () => {
    render(<FieldTitle title="My Field" isUnique={false} isTitle={false} />);
    expect(screen.getByText("My Field")).toBeVisible();
  });

  test("shows (unique) label when isUnique is true", () => {
    render(<FieldTitle title="Name" isUnique={true} isTitle={false} />);
    expect(screen.getByText("(unique)")).toBeVisible();
  });

  test("hides (unique) label when isUnique is false", () => {
    render(<FieldTitle title="Name" isUnique={false} isTitle={false} />);
    expect(screen.queryByText("(unique)")).not.toBeInTheDocument();
  });

  test("shows Title tag when isTitle is true", () => {
    render(<FieldTitle title="Name" isUnique={false} isTitle={true} />);
    expect(screen.getByText("Title")).toBeVisible();
  });

  test("hides Title tag when isTitle is false", () => {
    render(<FieldTitle title="Name" isUnique={false} isTitle={false} />);
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });

  test("shows both (unique) label and Title tag together", () => {
    render(<FieldTitle title="Name" isUnique={true} isTitle={true} />);
    expect(screen.getByText("(unique)")).toBeVisible();
    expect(screen.getByText("Title")).toBeVisible();
  });
});
