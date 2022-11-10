import { Key } from "rc-table/lib/interface";
import { CSSProperties, useCallback, useEffect, useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Tree, { DataNode, TreeProps } from "@reearth-cms/components/atoms/Tree";
import { AssetFile } from "@reearth-cms/components/molecules/Asset/asset.type";

type Props = {
  file: AssetFile;
  style?: CSSProperties;
};

const UnzipFileList: React.FC<Props> = ({ file, style }) => {
  const [expandedKeys, setExpandedKeys] = useState<DataNode["key"][]>(["0"]);
  const [selectedKeys, setSelectedKeys] = useState<DataNode["key"][]>([]);
  const [treeData, setTreeData] = useState<DataNode[]>([]);

  const getTreeData = useCallback((assetFile: AssetFile, key = ""): DataNode[] => {
    return (
      assetFile?.children?.map((file: AssetFile, index: number) => {
        let children: DataNode[] = [];
        if (file.children && file.children.length > 0) {
          children = getTreeData(
            file,
            key === "" ? index.toString() : key + "-" + index.toString(),
          );
        }
        return {
          title: file.name,
          key: key === "" ? index.toString() : key + "-" + index.toString(),
          children: children,
        };
      }) || []
    );
  }, []);

  useEffect(() => {
    setTreeData(getTreeData(file));
  }, [file, getTreeData]);

  const onSelect: TreeProps["onSelect"] = (keys: Key[]) => {
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
      showLine
    />
  );
};

export default UnzipFileList;
