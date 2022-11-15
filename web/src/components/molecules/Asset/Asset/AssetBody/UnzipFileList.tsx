import { Key } from "rc-table/lib/interface";
import { CSSProperties, useCallback, useEffect, useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Tree, { DataNode, TreeProps } from "@reearth-cms/components/atoms/Tree";
import { AssetFile } from "@reearth-cms/components/molecules/Asset/asset.type";

type Props = {
  file: AssetFile;
  assetBaseUrl: string;
  setAssetUrl: (url: string) => void;
  style?: CSSProperties;
};

type FileNode = DataNode & {
  file: AssetFile;
};

const UnzipFileList: React.FC<Props> = ({ file, assetBaseUrl, setAssetUrl, style }) => {
  const [expandedKeys, setExpandedKeys] = useState<FileNode["key"][]>(["0"]);
  const [selectedKeys, setSelectedKeys] = useState<FileNode["key"][]>([]);
  const [treeData, setTreeData] = useState<FileNode[]>([]);

  const getTreeData = useCallback(
    (assetFile: AssetFile, parentKey?: string): FileNode[] =>
      assetFile?.children?.map((file: AssetFile, index: number) => {
        let children: FileNode[] = [];
        const key = parentKey ? parentKey + "-" + index.toString() : index.toString();

        if (file.children && file.children.length > 0) {
          children = getTreeData(file, key);
        }

        return {
          title: file.name,
          key: key,
          children: children,
          file: file,
        };
      }) || [],
    [],
  );

  useEffect(() => {
    setTreeData(getTreeData(file));
  }, [file, getTreeData]);

  const previewFile = (file: AssetFile) => {
    setAssetUrl(assetBaseUrl + file.path);
  };

  const onSelect: TreeProps<FileNode>["onSelect"] = (keys: Key[], { node: { file } }) => {
    previewFile(file);
    setSelectedKeys(keys);
  };

  const onExpand: TreeProps["onExpand"] = (keys: Key[]) => {
    setExpandedKeys([...keys]);
  };

  return (
    <Tree
      switcherIcon={<Icon icon="caretDown" />}
      expandedKeys={[...expandedKeys]}
      selectedKeys={[...selectedKeys]}
      onSelect={onSelect}
      onExpand={onExpand}
      treeData={treeData}
      style={style}
      multiple={false}
      showLine
    />
  );
};

export default UnzipFileList;
