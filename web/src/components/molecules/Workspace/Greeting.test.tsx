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
});
