import { render } from "@testing-library/react";

// override render export
const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    // wrap provider(s) here if needed
    wrapper: ({ children }) => children,
    ...options,
  });

export { customRender as render };
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
export { Test, DATA_TEST_ID } from "./data";
