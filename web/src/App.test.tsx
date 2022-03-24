import { screen, render } from "@testing-library/react";
import { expect, test } from "vitest";

import App from "./App";

test("hello, world", () => {
  render(<App />);
  expect(screen.getByText(/Hello Vite \+ React!/i)).toBeInTheDocument();
});
