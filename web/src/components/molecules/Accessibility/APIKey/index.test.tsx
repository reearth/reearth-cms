import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import type { APIKey } from "../types";

import APIKeyComponent from ".";

type APIKeyTableProps = {
  keys?: APIKey[];
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onAPIKeyDelete: (id: string) => Promise<void>;
  onAPIKeyEdit: (keyId?: string) => void;
};

let capturedTableProps: APIKeyTableProps | null = null;

vi.mock("@reearth-cms/components/atoms/Icon", () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

vi.mock("./APIKeyTable", () => ({
  default: (props: APIKeyTableProps) => {
    capturedTableProps = props;
    return <div data-testid="mock-api-key-table" />;
  },
}));

const sampleKeys: APIKey[] = [
  {
    id: "k1",
    name: "Key One",
    description: "",
    key: "sk-1",
    publication: { publicModels: [], publicAssets: false },
  },
];

describe("APIKeyComponent", () => {
  const user = userEvent.setup();

  const defaultProps = {
    isPublic: false,
    keys: sampleKeys,
    hasCreateRight: true,
    hasUpdateRight: true,
    hasDeleteRight: true,
    onAPIKeyNew: vi.fn(),
    onAPIKeyEdit: vi.fn(),
    onAPIKeyDelete: vi.fn(() => Promise.resolve()),
    onSettingsPageOpen: vi.fn(),
  };

  test("renders API Key section title", () => {
    render(<APIKeyComponent {...defaultProps} />);

    expect(screen.getByText("API Key")).toBeVisible();
  });

  test("renders New Key button", () => {
    render(<APIKeyComponent {...defaultProps} />);

    expect(screen.getByRole("button", { name: /New Key/ })).toBeVisible();
  });

  test("New Key button calls onAPIKeyNew on click", async () => {
    const onAPIKeyNew = vi.fn();
    render(<APIKeyComponent {...defaultProps} onAPIKeyNew={onAPIKeyNew} />);

    await user.click(screen.getByRole("button", { name: /New Key/ }));

    expect(onAPIKeyNew).toHaveBeenCalledOnce();
  });

  test("New Key button disabled when isPublic=true", () => {
    render(<APIKeyComponent {...defaultProps} isPublic={true} />);

    expect(screen.getByRole("button", { name: /New Key/ })).toBeDisabled();
  });

  test("New Key button disabled when hasCreateRight=false", () => {
    render(<APIKeyComponent {...defaultProps} hasCreateRight={false} />);

    expect(screen.getByRole("button", { name: /New Key/ })).toBeDisabled();
  });

  test("shows public message and visibility button when isPublic=true", async () => {
    const onSettingsPageOpen = vi.fn();
    render(
      <APIKeyComponent {...defaultProps} isPublic={true} onSettingsPageOpen={onSettingsPageOpen} />,
    );

    expect(
      screen.getByText("Please transfer your project to private to use the API key"),
    ).toBeVisible();

    const visibilityButton = screen.getByRole("button", { name: "Change project visibility" });
    expect(visibilityButton).toBeVisible();
    await user.click(visibilityButton);
    expect(onSettingsPageOpen).toHaveBeenCalledOnce();

    expect(screen.queryByTestId("mock-api-key-table")).not.toBeInTheDocument();
  });

  test("renders APIKeyTable with correct props when not public", () => {
    capturedTableProps = null;
    render(<APIKeyComponent {...defaultProps} />);

    expect(screen.getByTestId("mock-api-key-table")).toBeVisible();
    expect(capturedTableProps).not.toBeNull();
    if (!capturedTableProps) return;
    expect(capturedTableProps.keys).toBe(defaultProps.keys);
    expect(capturedTableProps.hasUpdateRight).toBe(true);
    expect(capturedTableProps.hasDeleteRight).toBe(true);
    expect(capturedTableProps.onAPIKeyDelete).toBe(defaultProps.onAPIKeyDelete);
    expect(capturedTableProps.onAPIKeyEdit).toBe(defaultProps.onAPIKeyEdit);

    expect(
      screen.queryByText("Please transfer your project to private to use the API key"),
    ).not.toBeInTheDocument();
  });
});
