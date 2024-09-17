import { expect, test } from "vitest";

import { AssetFile } from "@reearth-cms/components/molecules/Asset/types";

import { generateAssetTreeData } from "./generateAssetTreeData";

test("returns empty array if filePaths property is not provided", () => {
  const result = generateAssetTreeData({ name: "", path: "/" });
  expect(result).toEqual([]);
});

test("returns correct file tree data", () => {
  const file: AssetFile = {
    name: "root",
    path: "/",
    filePaths: [
      "/folder1/file1.txt",
      "/folder1/folder2/file2.txt",
      "/folder3/file3.txt",
      "/folder3/file4.txt",
    ],
  };
  const result = generateAssetTreeData(file);

  // /folder1/
  expect(result[0].key).toEqual("0-0");
  expect(result[0].name).toEqual("folder1");
  expect(result[0].path).toEqual("/folder1/");
  expect(result[0].children.length).toEqual(2);

  // /folder1/file1.txt
  expect(result[0].children[0].key).toEqual("0-1");
  expect(result[0].children[0].name).toEqual("file1.txt");
  expect(result[0].children[0].path).toEqual("/folder1/file1.txt");
  expect(result[0].children[0].children.length).toEqual(0);

  // /folder1/folder2/
  expect(result[0].children[1].key).toEqual("1-1");
  expect(result[0].children[1].name).toEqual("folder2");
  expect(result[0].children[1].path).toEqual("/folder1/folder2/");
  expect(result[0].children[1].children.length).toEqual(1);

  // /folder1/folder2/file2.txt
  expect(result[0].children[1].children[0].key).toEqual("1-2");
  expect(result[0].children[1].children[0].name).toEqual("file2.txt");
  expect(result[0].children[1].children[0].path).toEqual("/folder1/folder2/file2.txt");
  expect(result[0].children[1].children[0].children.length).toEqual(0);

  // /folder3/
  expect(result[1].key).toEqual("2-0");
  expect(result[1].name).toEqual("folder3");
  expect(result[1].path).toEqual("/folder3/");
  expect(result[1].children.length).toEqual(2);

  // /folder3/file3.txt
  expect(result[1].children[0].key).toEqual("2-1");
  expect(result[1].children[0].name).toEqual("file3.txt");
  expect(result[1].children[0].path).toEqual("/folder3/file3.txt");
  expect(result[1].children[0].children.length).toEqual(0);

  // /folder3/file4.txt
  expect(result[1].children[1].key).toEqual("3-1");
  expect(result[1].children[1].name).toEqual("file4.txt");
  expect(result[1].children[1].path).toEqual("/folder3/file4.txt");
  expect(result[1].children[1].children.length).toEqual(0);
});
