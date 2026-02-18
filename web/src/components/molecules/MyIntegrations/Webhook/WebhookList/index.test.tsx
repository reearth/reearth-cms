import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, describe, vi } from "vitest";

import { Webhook } from "@reearth-cms/components/molecules/MyIntegrations/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils.ts";

import WebhookList from ".";

describe("Webhook list", () => {
  const user = userEvent.setup();

  const webhooks: Webhook[] = [];
  const onWebhookDelete = () => {
    return Promise.resolve();
  };
  const onWebhookUpdate = async () => {
    return Promise.resolve();
  };
  const onWebhookSelect = () => {};
  const onShowForm = () => {};

  test("No webhook text and document link are displayed successfully", async () => {
    render(
      <WebhookList
        webhooks={webhooks}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        onWebhookSelect={onWebhookSelect}
        onShowForm={onShowForm}
      />,
    );

    expect(screen.getByText("No Webhook yet")).toBeVisible();
    expect(screen.getByText("how to use Re:Earth CMS")).toBeVisible();
  });

  test("Create webhook buttons work successfully", async () => {
    const onShowFormMock = vi.fn();

    render(
      <WebhookList
        webhooks={webhooks}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        onWebhookSelect={onWebhookSelect}
        onShowForm={onShowFormMock}
      />,
    );

    const newWebhookButton = screen.getByTestId(DATA_TEST_ID.WebhookList__NewWebhookButton);
    const emptyNewWebhookButton = screen.getByTestId(
      DATA_TEST_ID.WebhookList__EmptyNewWebhookButton,
    );

    expect(newWebhookButton).toBeVisible();
    expect(emptyNewWebhookButton).toBeVisible();

    await user.click(newWebhookButton);
    await user.click(emptyNewWebhookButton);

    expect(onShowFormMock).toHaveBeenCalledTimes(2);
  });

  test("Webhooks are displayed successfully", async () => {
    const name1 = "name1";
    const name2 = "name2";

    render(
      <WebhookList
        webhooks={[
          {
            id: "",
            name: name1,
            url: "",
            active: false,
            secret: "",
            trigger: {},
          },
          {
            id: "",
            name: name2,
            url: "",
            active: false,
            secret: "",
            trigger: {},
          },
        ]}
        onWebhookDelete={onWebhookDelete}
        onWebhookUpdate={onWebhookUpdate}
        onWebhookSelect={onWebhookSelect}
        onShowForm={onShowForm}
      />,
    );

    expect(screen.getByTestId(DATA_TEST_ID.WebhookList__NewWebhookButton)).toBeVisible();
    expect(screen.getByText(name1)).toBeVisible();
    expect(screen.getByText(name2)).toBeVisible();
  });
});
