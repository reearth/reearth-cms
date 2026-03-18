import { TreeDataNode } from "@reearth-cms/components/atoms/Tree";

export type FileNode = TreeDataNode & {
  name: string;
  path: string;
  children: FileNode[];
};
