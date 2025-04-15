import { DataNode } from "@reearth-cms/components/atoms/Tree";

export type FileNode = DataNode & {
  name: string;
  path: string;
  children: FileNode[];
};
