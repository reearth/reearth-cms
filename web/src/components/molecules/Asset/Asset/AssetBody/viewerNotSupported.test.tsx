import { screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@reearth-cms/i18n", () => ({ useT: () => (key: string) => key }));
vi.mock("@reearth-cms/components/atoms/Icon", () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

import { render } from "@reearth-cms/test/utils";

import ViewerNotSupported from "./viewerNotSupported";

describe("ViewerNotSupported", () => {
  test("renders 'Not supported' text", () => {
    render(<ViewerNotSupported />);
    expect(screen.getByText("Not supported")).toBeInTheDocument();
  });

  test("renders exclamation circle icon", () => {
    render(<ViewerNotSupported />);
    expect(screen.getByTestId("icon-exclamationCircle")).toBeInTheDocument();
  });
});
