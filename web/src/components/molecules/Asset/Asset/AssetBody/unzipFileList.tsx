import { CaretDownFilled } from "@ant-design/icons";
import Tree from "@reearth-cms/components/atoms/Tree";
import type { DataNode, TreeProps } from "antd/lib/tree";
import { CSSProperties, useState } from "react";

type UnzipFileListProps = {
  style?: CSSProperties;
};

// TODO: this data is hardcodded, actual data should be formatted in a similar way.
const treeData: DataNode[] = [
  {
    title: "Folder",
    key: "0-0",
    children: [
      {
        title: "Folder",
        key: "0-0-0",
        children: [
          {
            title: "File",
            key: "0-0-0-0",
          },
          {
            title: "File",
            key: "0-0-0-1",
          },
          {
            title: "File",
            key: "0-0-0-2",
          },
        ],
      },
      {
        title: "Folder",
        key: "0-0-1",
        children: [
          {
            title: "File",
            key: "0-0-1-0",
          },
        ],
      },
      {
        title: "Folder",
        key: "0-0-2",
        children: [
          {
            title: "File",
            key: "0-0-2-0",
          },
          {
            title: "File",
            key: "0-0-2-1",
          },
        ],
      },
    ],
  },
  {
    title: "File",
    key: "0-1",
  },
  {
    title: "File",
    key: "0-2",
  },
];

const UnzipFileList: React.FC<UnzipFileListProps> = ({ style }) => {
  const [expandedKeys, setExpandedKeys] = useState<DataNode["key"][]>(["0-0"]);
  const [selectedKeys, setSelectedKeys] = useState<DataNode["key"][]>([]);

  const onSelect: TreeProps["onSelect"] = (selectedKeys) => {
    setSelectedKeys(selectedKeys);
  };

  const onExpand: TreeProps["onExpand"] = (expandedKeys) => {
    setExpandedKeys([...expandedKeys]);
  };

  return (
    <Tree
      switcherIcon={<CaretDownFilled />}
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
