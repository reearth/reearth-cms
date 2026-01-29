/* eslint-disable @typescript-eslint/no-extraneous-class */
import { render } from "@testing-library/react";

import { RcFile } from "@reearth-cms/components/atoms/Upload";

// override render export
const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    // wrap provider(s) here if needed
    wrapper: ({ children }) => children,
    ...options,
  });

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

abstract class Test {
  public static createMockRcFile(
    options: { name?: string; type?: string; uid?: string } = {},
  ): RcFile {
    const { name = "test-file.png", type = "image/png", uid = "-1" } = options;

    const file = new File(["file content"], name, { type });

    const rcFile = file as RcFile;
    rcFile.uid = uid;
    return rcFile;
  }
}

export { customRender as render, Test };
