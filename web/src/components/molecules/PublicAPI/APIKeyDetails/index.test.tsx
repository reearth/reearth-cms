import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { t } from "@reearth-cms/i18n";

import { APIKey, KeyFormType } from "../types";

import APIKeyDetails from ".";

describe("APIKeyDetails", () => {
  const user = userEvent.setup();

  const apiUrl = "https://test.com/api/";
  const keyModels = [{ id: "m1", name: "Model One", key: "model1" }];
  const newKeyValues: KeyFormType = {
    name: "",
    description: "",
    key: "",
    assetPublic: false,
    models: { m1: false },
  };
  const currentKey: APIKey = {
    id: "k1",
    name: "My Key",
    description: "desc",
    key: "secret-token",
    publication: { publicModels: [], publicAssets: false },
  };
  const existingKeyValues: KeyFormType = {
    name: currentKey.name,
    description: currentKey.description,
    key: currentKey.key,
    assetPublic: false,
    models: { m1: false },
  };

  const saveButton = () => screen.getByRole("button", { name: "Save Changes" });
  const regenerateButton = () => screen.getByRole("button", { name: t("Re-generate") });

  const renderDetails = ({
    isNewKey = true,
    hasCreateRight = true,
    hasUpdateRight = true,
    hasPublishRight = true,
    initialValues = isNewKey ? newKeyValues : existingKeyValues,
    keyId = isNewKey ? undefined : currentKey.id,
    key = isNewKey ? undefined : currentKey,
    onAPIKeyCreate = vi.fn().mockResolvedValue(undefined),
    onAPIKeyUpdate = vi.fn().mockResolvedValue(undefined),
    onAPIKeyRegenerate = vi.fn().mockResolvedValue(undefined),
  }: {
    isNewKey?: boolean;
    hasCreateRight?: boolean;
    hasUpdateRight?: boolean;
    hasPublishRight?: boolean;
    initialValues?: KeyFormType;
    keyId?: string;
    key?: APIKey;
    onAPIKeyCreate?: APIKeyDetailsProps["onAPIKeyCreate"];
    onAPIKeyUpdate?: APIKeyDetailsProps["onAPIKeyUpdate"];
    onAPIKeyRegenerate?: APIKeyDetailsProps["onAPIKeyRegenerate"];
  } = {}) =>
    render(
      <APIKeyDetails
        apiUrl={apiUrl}
        currentKey={key}
        hasPublishRight={hasPublishRight}
        hasCreateRight={hasCreateRight}
        hasUpdateRight={hasUpdateRight}
        initialValues={initialValues}
        isNewKey={isNewKey}
        keyId={keyId}
        keyModels={keyModels}
        onAPIKeyCreate={onAPIKeyCreate}
        onAPIKeyUpdate={onAPIKeyUpdate}
        onAPIKeyRegenerate={onAPIKeyRegenerate}
      />,
    );

  test("for a new key: shows the new-key title, hides the token and Re-generate, enables Save", () => {
    renderDetails();
    expect(screen.getByText(/New API Key/)).toBeVisible();
    expect(screen.queryByTestId("key")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: t("Re-generate") })).not.toBeInTheDocument();
    expect(saveButton()).toBeEnabled();
  });

  test("for a new key without create right: Save is disabled", () => {
    renderDetails({ hasCreateRight: false });
    expect(saveButton()).toBeDisabled();
  });

  test("for an existing key: shows the key name and the token field with Re-generate", () => {
    renderDetails({ isNewKey: false });
    expect(screen.getByText(/My Key/)).toBeVisible();
    expect(screen.getByTestId("key")).toBeInTheDocument();
    expect(regenerateButton()).toBeInTheDocument();
  });

  test("Re-generate is disabled without update right", () => {
    renderDetails({ isNewKey: false, hasUpdateRight: false });
    expect(regenerateButton()).toBeDisabled();
  });

  test("Re-generate calls onAPIKeyRegenerate with the key id", async () => {
    const onAPIKeyRegenerate = vi.fn().mockResolvedValue(undefined);
    renderDetails({ isNewKey: false, onAPIKeyRegenerate });

    await user.click(regenerateButton());
    expect(onAPIKeyRegenerate).toHaveBeenCalledWith(currentKey.id);
  });

  test("creating a key submits the name, description and selected models", async () => {
    const onAPIKeyCreate = vi.fn().mockResolvedValue(undefined);
    renderDetails({ onAPIKeyCreate });

    await user.type(screen.getByLabelText(t("Name")), "New");
    // First switch is the model row; the trailing switch is the Assets row.
    await user.click(screen.getAllByRole("switch")[0]);
    await user.click(saveButton());

    expect(onAPIKeyCreate).toHaveBeenCalledWith("New", "", {
      publicModels: ["m1"],
      publicAssets: false,
    });
  });

  test("updating a key submits the id and the edited fields", async () => {
    const onAPIKeyUpdate = vi.fn().mockResolvedValue(undefined);
    renderDetails({ isNewKey: false, onAPIKeyUpdate });

    await user.clear(screen.getByLabelText(t("Name")));
    await user.type(screen.getByLabelText(t("Name")), "Renamed");
    await user.click(saveButton());

    expect(onAPIKeyUpdate).toHaveBeenCalledWith(currentKey.id, "Renamed", currentKey.description, {
      publicModels: [],
      publicAssets: false,
    });
  });
});

type APIKeyDetailsProps = React.ComponentProps<typeof APIKeyDetails>;
