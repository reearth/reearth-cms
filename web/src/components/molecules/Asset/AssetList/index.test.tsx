import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { expect, test, describe } from "vitest";

import AssetList from ".";

dayjs.extend(relativeTime);
dayjs.extend(utc);

describe("AssetList", () => {
  const user = userEvent.setup();

  const userId = "";
  const content = "test comment";
  const assets = [
    {
      id: "",
      createdAt: "",
      createdBy: { id: "", name: "" },
      createdByType: "",
      fileName: "",
      projectId: "",
      size: 0,
      url: "",
      comments: [
        {
          id: "",
          author: { id: "", name: "", type: null },
          content,
          createdAt: "",
        },
      ],
      items: [],
    },
  ];
  const totalCount = 0;
  const page = 0;
  const pageSize = 0;
  const sort = undefined;
  const searchTerm = "";
  const columns = {};
  const loading = false;
  const deleteLoading = false;
  const hasCreateRight = true;
  const hasDeleteRight = true;
  const onColumnsChange = () => {};
  const onAssetItemSelect = () => {};
  const onAssetsCreate = () => {
    return Promise.resolve([]);
  };
  const onAssetCreateFromUrl = () => {
    return Promise.resolve(undefined);
  };
  const onSearchTerm = () => {};
  const onAssetDelete = () => {
    return Promise.resolve();
  };
  const onNavigateToAsset = () => {};
  const onAssetsReload = () => {};
  const onAssetTableChange = () => {};

  const commentProps = {
    onCommentCreate: () => {
      return Promise.resolve();
    },
    onCommentUpdate: () => {
      return Promise.resolve();
    },
    onCommentDelete: () => {
      return Promise.resolve();
    },
    hasCreateRight: true,
    hasUpdateRight: true,
    hasDeleteRight: true,
  };

  test("Title, table, and comment panel are visible successfully", async () => {
    render(
      <AssetList
        userId={userId}
        assets={assets}
        loading={loading}
        deleteLoading={deleteLoading}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        sort={sort}
        searchTerm={searchTerm}
        columns={columns}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        onColumnsChange={onColumnsChange}
        onAssetItemSelect={onAssetItemSelect}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrl}
        onAssetDelete={onAssetDelete}
        onSearchTerm={onSearchTerm}
        onNavigateToAsset={onNavigateToAsset}
        onAssetsReload={onAssetsReload}
        onAssetTableChange={onAssetTableChange}
        commentProps={commentProps}
      />,
    );

    expect(screen.getByText("Asset")).toBeVisible();
    expect(screen.getByRole("table")).toBeVisible();
    expect(screen.getByLabelText("comment")).toBeVisible();
  });

  test("Comment panel is toggled successfully", async () => {
    render(
      <AssetList
        userId={userId}
        assets={assets}
        loading={loading}
        deleteLoading={deleteLoading}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        sort={sort}
        searchTerm={searchTerm}
        columns={columns}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        onColumnsChange={onColumnsChange}
        onAssetItemSelect={onAssetItemSelect}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrl}
        onAssetDelete={onAssetDelete}
        onSearchTerm={onSearchTerm}
        onNavigateToAsset={onNavigateToAsset}
        onAssetsReload={onAssetsReload}
        onAssetTableChange={onAssetTableChange}
        commentProps={commentProps}
      />,
    );

    const commentButton = screen.getByLabelText("comment");
    expect(commentButton).toBeVisible();

    await user.click(commentButton);
    expect(commentButton).not.toBeVisible();
    expect(screen.getByText(/Please click/)).toBeVisible();

    const commentTitle = screen.getByRole("heading", { name: "Comments" });
    await user.click(commentTitle);
    expect(commentTitle).not.toBeVisible();
    expect(screen.getByLabelText("comment")).toBeVisible();
  });

  test("Comment button on item row works successfully", async () => {
    render(
      <AssetList
        userId={userId}
        assets={assets}
        loading={loading}
        deleteLoading={deleteLoading}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        sort={sort}
        searchTerm={searchTerm}
        columns={columns}
        hasCreateRight={hasCreateRight}
        hasDeleteRight={hasDeleteRight}
        onColumnsChange={onColumnsChange}
        onAssetItemSelect={onAssetItemSelect}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrl}
        onAssetDelete={onAssetDelete}
        onSearchTerm={onSearchTerm}
        onNavigateToAsset={onNavigateToAsset}
        onAssetsReload={onAssetsReload}
        onAssetTableChange={onAssetTableChange}
        commentProps={commentProps}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: assets[0].comments.length.toString(),
      }),
    );
    expect(screen.getByText(content)).toBeVisible();
  });
});
