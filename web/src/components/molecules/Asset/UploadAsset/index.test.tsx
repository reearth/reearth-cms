import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { expect, test, describe } from "vitest";

import UploadAsset from ".";

dayjs.extend(relativeTime);
dayjs.extend(utc);

describe("UploadAsset", () => {
  const user = userEvent.setup();

  const hasCreateRight = true;
  const onAssetsCreate = () => {
    return Promise.resolve([]);
  };
  const onAssetCreateFromUrl = () => {
    return Promise.resolve(undefined);
  };

  test("Modal open button works successfully", async () => {
    render(
      <UploadAsset
        hasCreateRight={hasCreateRight}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrl}
      />,
    );

    await user.click(screen.getByRole("button"));
    const dialog = screen.getByRole("dialog");
    await expect.poll(() => dialog).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(dialog).not.toBeVisible();
  });

  test("Modal open button is disabled according to user right successfully", async () => {
    render(
      <UploadAsset
        hasCreateRight={false}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrl}
      />,
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
