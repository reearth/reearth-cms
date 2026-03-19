import { render, screen } from "@testing-library/react";
import { expect, test, describe } from "vitest";

import Greeting from "./Greeting";

describe("Greeting", () => {
  test("Cover image display successfully", () => {
    const coverImageUrl = "https://test.com/test.png";
    render(<Greeting coverImageUrl={coverImageUrl} />);
    const img = screen.queryByRole("img");
    expect(img).toBeVisible();
    expect(img?.getAttribute("src")).toBe(coverImageUrl);
  });

  test("renders dashboard card with welcome text when no coverImageUrl", () => {
    render(<Greeting />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(/Welcome to Re:Earth CMS/)).toBeVisible();
    expect(
      screen.getByText(
        /Re:Earth CMS is a robust tool for collecting, creating, storing, and managing data/,
      ),
    ).toBeVisible();
  });

  test("interpolates username in welcome title", () => {
    render(<Greeting username="Alice" />);
    expect(screen.getByText(/Welcome to Re:Earth CMS, Alice!/)).toBeVisible();
  });
});
