import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { expect, test, describe, vi } from "vitest";

import { Asset } from "@reearth-cms/components/molecules/Asset/types";

import UploadModal from ".";

dayjs.extend(relativeTime);
dayjs.extend(utc);

describe("UploadModal", () => {
  const user = userEvent.setup();

  const isOpen = true;
  const modalClose = () => {
    return Promise.resolve();
  };
  const onAssetsCreate = () => {
    return Promise.resolve([]);
  };
  const id = "id";
  const onAssetCreateFromUrl = () => {
    return new Promise<Asset>(resolve => {
      setTimeout(() => {
        resolve({
          id,
          createdAt: "",
          createdBy: { id: "", name: "" },
          createdByType: "",
          fileName: "",
          projectId: "",
          size: 0,
          url: "",
          comments: [],
          items: [],
        });
      }, 100);
    });
  };
  const onLink = undefined;

  test("Modal works successfully", async () => {
    render(
      <UploadModal
        isOpen={isOpen}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrl}
        modalClose={modalClose}
        onLink={onLink}
      />,
    );

    await expect.poll(() => screen.getByRole("heading", { name: "Asset Uploader" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Local", selected: true })).toBeVisible();
    expect(screen.getByRole("tab", { name: "URL", selected: false })).toBeVisible();
    expect(screen.getByRole("button", { name: /inbox/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
    const uploadButton = screen.getByRole("button", { name: "Upload" });
    expect(uploadButton).toBeVisible();
    expect(uploadButton).toBeDisabled();
  });

  test("Upload asset from URL event is called successfully", async () => {
    const onAssetCreateFromUrlMock = vi.fn(onAssetCreateFromUrl);
    const modalCloseMock = vi.fn();

    render(
      <UploadModal
        isOpen={isOpen}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrlMock}
        modalClose={modalCloseMock}
        onLink={onLink}
      />,
    );

    const url = "u";
    const uploadButton = screen.getByRole("button", { name: "Upload" });
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    const urlTab = screen.getByRole("tab", { name: "URL" });

    await user.click(urlTab);
    await user.type(screen.getByRole("textbox"), url);
    await user.click(uploadButton);
    expect(screen.getByRole("button", { name: "loading Uploading" })).toBeVisible();
    expect(cancelButton).toBeDisabled();
    expect(onAssetCreateFromUrlMock).toHaveBeenCalledWith(url, false);

    await expect
      .poll(() => screen.getByRole("tab", { name: "Local", selected: true }))
      .toBeVisible();
    expect(cancelButton).toBeEnabled();
    expect(uploadButton).toBeDisabled();

    await user.click(urlTab);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  test("Upload zip with unzipping from URL event is called successfully", async () => {
    const onAssetCreateFromUrlMock = vi.fn(onAssetCreateFromUrl);

    render(
      <UploadModal
        isOpen={isOpen}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrlMock}
        modalClose={modalClose}
        onLink={onLink}
      />,
    );

    const url = ".zip";
    const urlTab = screen.getByRole("tab", { name: "URL" });

    await user.click(urlTab);
    expect(screen.queryByText("Auto Unzip")).not.toBeInTheDocument();

    await user.type(screen.getByRole("textbox"), url);
    expect(screen.getByText("Auto Unzip")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Upload" }));
    expect(onAssetCreateFromUrlMock).toHaveBeenCalledWith(url, true);

    await user.click(urlTab);
    expect.poll(() => screen.queryByText("Auto Unzip")).not.toBeInTheDocument();
  });

  test("Upload zip without unzipping from URL event is called successfully", async () => {
    const onAssetCreateFromUrlMock = vi.fn(onAssetCreateFromUrl);

    render(
      <UploadModal
        isOpen={isOpen}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrlMock}
        modalClose={modalClose}
        onLink={onLink}
      />,
    );

    const url = ".zip";
    const urlTab = screen.getByRole("tab", { name: "URL" });

    await user.click(urlTab);
    await user.type(screen.getByRole("textbox"), url);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Upload" }));
    expect(onAssetCreateFromUrlMock).toHaveBeenCalledWith(url, false);

    await user.click(urlTab);
    await expect.poll(() => screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  test("Upload button is toggled successfully", async () => {
    render(
      <UploadModal
        isOpen={isOpen}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrl}
        modalClose={modalClose}
        onLink={onLink}
      />,
    );

    const url = "u";
    const localTab = screen.getByRole("tab", { name: "Local" });
    const urlTab = screen.getByRole("tab", { name: "URL" });
    const uploadButton = screen.getByRole("button", { name: "Upload" });

    await user.click(urlTab);
    await user.type(screen.getByRole("textbox"), url);
    expect(uploadButton).toBeEnabled();

    await user.click(localTab);
    expect(uploadButton).toBeDisabled();

    await user.click(urlTab);
    expect(uploadButton).toBeEnabled();
    expect(screen.getByRole("textbox")).toHaveValue(url);
  });

  test("Asset link event is called successfully", async () => {
    const onLinkMock = vi.fn();

    render(
      <UploadModal
        isOpen={isOpen}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrl}
        modalClose={modalClose}
        onLink={onLinkMock}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "URL" }));
    await user.type(screen.getByRole("textbox"), "u");
    await user.click(screen.getByRole("button", { name: "Upload and Link" }));
    await expect.poll(() => onLinkMock).toHaveBeenCalledWith(id);
  });
});
