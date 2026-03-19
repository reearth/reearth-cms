import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import ProjectOverview from ".";

const user = userEvent.setup();

const buildModel = (id: string, name: string) => ({
  id,
  name,
  description: `${name} description`,
  key: `${name}-key`,
  schemaId: `${name}-schema-id`,
  schema: { id: `${name}-schema-id`, fields: [] },
  metadataSchema: {},
  order: 1,
});

const buildProps = (overrides: Record<string, unknown> = {}) => ({
  models: undefined as ReturnType<typeof buildModel>[] | undefined,
  hasCreateRight: true,
  hasUpdateRight: true,
  hasDeleteRight: true,
  hasSchemaCreateRight: true,
  hasContentCreateRight: true,
  exportLoading: false,
  onProjectUpdate: vi.fn().mockResolvedValue(undefined),
  onModelSearch: vi.fn(),
  onModelSort: vi.fn(),
  onModelModalOpen: vi.fn(),
  onHomeNavigation: vi.fn(),
  onSchemaNavigate: vi.fn(),
  onImportSchemaNavigate: vi.fn(),
  onContentNavigate: vi.fn(),
  onImportContentNavigate: vi.fn(),
  onModelDeletionModalOpen: vi.fn().mockResolvedValue(undefined),
  onModelUpdateModalOpen: vi.fn().mockResolvedValue(undefined),
  onModelExport: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("ProjectOverview", () => {
  test("renders Models heading and New Model button", () => {
    render(<ProjectOverview {...buildProps()} />);
    expect(screen.getByText("Models")).toBeVisible();
    expect(screen.getByTestId(DATA_TEST_ID.ProjectOverview__NewModelButton)).toBeVisible();
  });

  test("disables New Model button when hasCreateRight is false", () => {
    render(<ProjectOverview {...buildProps({ hasCreateRight: false })} />);
    expect(screen.getByTestId(DATA_TEST_ID.ProjectOverview__NewModelButton)).toBeDisabled();
  });

  test("calls onModelModalOpen on New Model click", async () => {
    const props = buildProps();
    render(<ProjectOverview {...props} />);
    await user.click(screen.getByTestId(DATA_TEST_ID.ProjectOverview__NewModelButton));
    expect(props.onModelModalOpen).toHaveBeenCalledOnce();
  });

  test("renders model cards when models provided", () => {
    const models = [buildModel("m1", "Model A"), buildModel("m2", "Model B")];
    render(<ProjectOverview {...buildProps({ models })} />);
    expect(screen.getByText("Model A")).toBeVisible();
    expect(screen.getByText("Model B")).toBeVisible();
  });

  test("renders empty state when models is empty", () => {
    render(<ProjectOverview {...buildProps({ models: [] })} />);
    expect(screen.getByText("No Models yet")).toBeVisible();
    expect(
      screen.getByTestId(DATA_TEST_ID.ProjectOverview__NewModelPlaceholderButton),
    ).toBeVisible();
  });

  test("renders empty state when models is undefined", () => {
    render(<ProjectOverview {...buildProps()} />);
    expect(screen.getByText("No Models yet")).toBeVisible();
  });

  test("placeholder button calls onModelModalOpen", async () => {
    const props = buildProps({ models: [] });
    render(<ProjectOverview {...props} />);
    await user.click(screen.getByTestId(DATA_TEST_ID.ProjectOverview__NewModelPlaceholderButton));
    expect(props.onModelModalOpen).toHaveBeenCalledOnce();
  });

  test("placeholder button disabled when hasCreateRight is false", () => {
    render(<ProjectOverview {...buildProps({ models: [], hasCreateRight: false })} />);
    expect(
      screen.getByTestId(DATA_TEST_ID.ProjectOverview__NewModelPlaceholderButton),
    ).toBeDisabled();
  });

  test("renders ProjectHeader search and sort controls", () => {
    render(<ProjectOverview {...buildProps()} />);
    expect(screen.getByPlaceholderText("search models")).toBeVisible();
    expect(screen.getByText("Sort by")).toBeVisible();
  });
});
