import { DataNode } from "@reearth-cms/components/atoms/Tree";

export type FileNode = {
  children: FileNode[];
  name: string;
  path: string;
} & DataNode;
