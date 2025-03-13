import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import { WebhookValues } from "@reearth-cms/components/molecules/MyIntegrations/types";

import WebhookForm from ".";

describe("Webhook form", () => {
  const user = userEvent.setup();

  const name = "name";
  const url = "http://test.com";
  const secret = "secret";
  const webhookInitialValues: WebhookValues = {
    id: "id",
    name,
    url,
    active: false,
    secret,
    trigger: [
      "onItemCreate",
      "onItemUpdate",
      "onItemDelete",
      "onItemPublish",
      "onItemUnPublish",
      "onAssetUpload",
      "onAssetDecompress",
      "onAssetDelete",
    ],
  };
  const loading = false;
  const onBack = () => {};
  const onWebhookCreate = () => {
    return Promise.resolve();
  };
  const onWebhookUpdate = async () => {
    return Promise.resolve();
  };

  test("All values are displayed successfully", async () => {
    render(
      <WebhookForm
        webhookInitialValues={webhookInitialValues}
        loading={loading}
        onBack={onBack}
        onWebhookCreate={onWebhookCreate}
        onWebhookUpdate={onWebhookUpdate}
      />,
    );

    const nameInput = screen.getByLabelText("Name");
    const urlInput = screen.getByLabelText("Url");
    const secretInput = screen.getByLabelText("Secret");

    expect(nameInput).toHaveValue(name);
    expect(urlInput).toHaveValue(url);
    expect(secretInput).toHaveValue(secret);
    expect(nameInput).toBeRequired();
    expect(urlInput).toBeRequired();
    expect(secretInput).toBeRequired();

    expect(screen.getByText("Trigger Event")).toBeVisible();

    expect(screen.getByRole("checkbox", { name: "Create" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Update" })).toBeChecked();
    expect(screen.getAllByRole("checkbox", { name: "Delete" })[0]).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Publish" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Unpublish" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Upload" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Decompress" })).toBeChecked();
    expect(screen.getAllByRole("checkbox", { name: "Delete" })[1]).toBeChecked();
  });

  test("Loading is displayed successfully", async () => {
    render(
      <WebhookForm
        webhookInitialValues={webhookInitialValues}
        loading={true}
        onBack={onBack}
        onWebhookCreate={onWebhookCreate}
        onWebhookUpdate={onWebhookUpdate}
      />,
    );

    expect(screen.getByRole("button", { name: "loading Save" })).toBeVisible();
  });

  test("Page back event is fired successfully", async () => {
    const onBackMock = vi.fn();

    render(
      <WebhookForm
        webhookInitialValues={webhookInitialValues}
        loading={loading}
        onBack={onBackMock}
        onWebhookCreate={onWebhookCreate}
        onWebhookUpdate={onWebhookUpdate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "arrow-left" }));
    expect(onBackMock).toHaveBeenCalled();
  });

  test("Button is toggled successfully", async () => {
    render(
      <WebhookForm
        webhookInitialValues={webhookInitialValues}
        loading={loading}
        onBack={onBack}
        onWebhookCreate={onWebhookCreate}
        onWebhookUpdate={onWebhookUpdate}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });
    const nameInput = screen.getByLabelText("Name");
    const createCheckbox = screen.getByRole("checkbox", { name: "Create" });
    expect(saveButton).toBeDisabled();

    await user.type(nameInput, "test");
    expect(saveButton).toBeEnabled();

    await user.clear(nameInput);
    await user.type(nameInput, name);
    expect(saveButton).toBeDisabled();

    await user.click(createCheckbox);
    expect(saveButton).toBeEnabled();

    await user.click(createCheckbox);
    expect(saveButton).toBeDisabled();
  });

  test("Create event is fired successfully", async () => {
    const onWebhookCreateMock = vi.fn();

    render(
      <WebhookForm
        webhookInitialValues={undefined}
        loading={loading}
        onBack={onBack}
        onWebhookCreate={onWebhookCreateMock}
        onWebhookUpdate={onWebhookUpdate}
      />,
    );

    const nameInput = screen.getByLabelText("Name");
    const urlInput = screen.getByLabelText("Url");
    const secretInput = screen.getByLabelText("Secret");
    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton).toBeDisabled();

    await user.type(nameInput, name);
    expect(saveButton).toBeDisabled();

    await user.type(urlInput, url);
    expect(saveButton).toBeDisabled();

    await user.type(secretInput, secret);
    await user.click(saveButton);
    expect(onWebhookCreateMock).toHaveBeenCalledWith({
      name,
      url,
      active: false,
      secret,
      trigger: {},
    });
    expect(saveButton).toBeDisabled();
  });

  test("Update event is fired successfully", async () => {
    const onWebhookUpdateMock = vi.fn();

    render(
      <WebhookForm
        webhookInitialValues={webhookInitialValues}
        loading={loading}
        onBack={onBack}
        onWebhookCreate={onWebhookCreate}
        onWebhookUpdate={onWebhookUpdateMock}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });
    const newText = "test";
    await user.type(screen.getByLabelText("Name"), newText);
    await user.click(saveButton);

    expect(onWebhookUpdateMock).toHaveBeenCalledWith({
      ...webhookInitialValues,
      name: webhookInitialValues.name + newText,
      trigger: {
        onItemCreate: true,
        onItemUpdate: true,
        onItemDelete: true,
        onItemPublish: true,
        onItemUnPublish: true,
        onAssetUpload: true,
        onAssetDecompress: true,
        onAssetDelete: true,
      },
    });
    expect(saveButton).toBeDisabled();
  });

  test("Form validation works successfully", async () => {
    render(
      <WebhookForm
        webhookInitialValues={undefined}
        loading={loading}
        onBack={onBack}
        onWebhookCreate={onWebhookCreate}
        onWebhookUpdate={onWebhookUpdate}
      />,
    );

    const nameInput = screen.getByLabelText("Name");
    const urlInput = screen.getByLabelText("Url");
    const secretInput = screen.getByLabelText("Secret");
    const saveButton = screen.getByRole("button", { name: "Save" });
    await user.click(screen.getByRole("checkbox", { name: "Create" }));

    expect(nameInput).toBeInvalid();
    expect(urlInput).toBeInvalid();
    expect(secretInput).toBeInvalid();
    expect(saveButton).toBeDisabled();

    await user.type(nameInput, name);
    expect(saveButton).toBeDisabled();

    await user.type(urlInput, "test");
    expect(urlInput).toBeInvalid();
    expect(saveButton).toBeDisabled();

    await user.clear(urlInput);
    await user.type(urlInput, url);
    expect(urlInput).toBeValid();

    await user.type(secretInput, secret);
    expect(saveButton).toBeEnabled();
  });
});
