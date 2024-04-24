import styled from "@emotion/styled";
import { Key } from "rc-table/lib/interface";

import Icon from "@reearth-cms/components/atoms/Icon";
import { AssetFile } from "@reearth-cms/components/molecules/Asset/types";

import { FileNode } from "./types";

export const generateAssetTreeData = (
  file: AssetFile,
  selectedKeys: Key[],
  assetBaseUrl: string,
): FileNode[] => {
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
          key: key,
          title: (
            <>
              {part}
              <CopyIcon
                selected={selectedKeys[0] === key}
                icon="copy"
                onClick={() => {
                  navigator.clipboard.writeText(assetBaseUrl + path);
                }}
              />
            </>
          ),
          name: part,
          path: path,
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

const CopyIcon = styled(Icon)<{ selected?: boolean }>`
  margin-left: 16px;
  visibility: ${({ selected }) => (selected ? "visible" : "hidden")};
  &:active {
    color: #096dd9;
  }
`;
