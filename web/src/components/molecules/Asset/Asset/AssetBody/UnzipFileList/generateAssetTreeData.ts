import { AssetFile } from "@reearth-cms/components/molecules/Asset/types";

import { FileNode } from "./types";

export const generateAssetTreeData = (file: AssetFile): FileNode[] => {
  if (!file.filePaths) return [];

  const root: FileNode = {
    key: "0",
    name: file.name,
    path: "/",
    children: [],
  };

  file.filePaths.forEach((filepath, i) => {
    const parts = filepath.split("/");
    let currentNode = root;

    parts.slice(1).forEach((part, j) => {
      const existingNode = currentNode.children?.find((node: FileNode) => node.name === part);
      if (!existingNode) {
        const key = `${i}-${j}`;
        const path = `${currentNode.path}${part}${/\.[^.]+$/.test(part) ? "" : "/"}`;
        const newNode: FileNode = {
          key,
          title: part,
          name: part,
          path,
          children: [],
        };

        currentNode.children?.push(newNode);
        currentNode = newNode;
      } else {
        currentNode = existingNode;
      }
    });
  });

  return root.children;
};
