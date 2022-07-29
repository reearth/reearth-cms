import Icon from "@reearth-cms/components/atoms/Icon";
import Tree, { DataNode, TreeProps } from "@reearth-cms/components/atoms/Tree";
import { CSSProperties, useState } from "react";

type Props = {
  style?: CSSProperties;
};

// TODO: this data is hard-codded, actual data should be formatted in a similar way.
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

const UnzipFileList: React.FC<Props> = ({ style }) => {
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
