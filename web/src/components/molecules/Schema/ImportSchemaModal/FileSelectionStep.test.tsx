import { describe, expect, test, vi } from "vitest";

import { DATA_TEST_ID, render, screen } from "@reearth-cms/test/utils";

import FileSelectionStep from "./FileSelectionStep";

describe("FileSelectionStep", () => {
  test("renders wrong file type alert when alertList contains the error", () => {
    render(
      <FileSelectionStep
        fileList={[]}
        alertList={[
          {
            message: "This file appears to be a content file, not a schema file",
            type: "error",
            closable: true,
            showIcon: true,
          },
        ]}
        onFileContentChange={vi.fn()}
        onFileRemove={vi.fn()}
      />,
    );

    expect(screen.getByTestId(DATA_TEST_ID.FileSelectionStep__FileSelect)).toBeInTheDocument();
    expect(
      screen.getByText("This file appears to be a content file, not a schema file"),
    ).toBeInTheDocument();
  });
});
