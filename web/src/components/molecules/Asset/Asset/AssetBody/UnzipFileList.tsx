import { CloseCircleFilled } from "@ant-design/icons";
import { Key } from "rc-table/lib/interface";
import { useCallback, useEffect, useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Spin from "@reearth-cms/components/atoms/Spin";
import Tree, { DataNode, TreeProps } from "@reearth-cms/components/atoms/Tree";
import {
  ArchiveExtractionStatus,
  AssetFile,
} from "@reearth-cms/components/molecules/Asset/asset.type";

type Props = {
  file: AssetFile;
  assetBaseUrl: string;
  archiveExtractionStatus: ArchiveExtractionStatus;
  setAssetUrl: (url: string) => void;
};

type FileNode = DataNode & {
  file: AssetFile;
};

const UnzipFileList: React.FC<Props> = ({
  file,
  assetBaseUrl,
  archiveExtractionStatus,
  setAssetUrl,
}) => {
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

  const previewFile = useCallback(
    (file: AssetFile) => {
      setAssetUrl(assetBaseUrl + file.path);
    },
    [assetBaseUrl, setAssetUrl],
  );

  const onSelect: TreeProps<FileNode>["onSelect"] = useCallback(
    (keys: Key[], { node: { file } }: { node: FileNode }) => {
      previewFile(file);
      setSelectedKeys(keys);
    },
    [previewFile],
  );

  const onExpand: TreeProps["onExpand"] = (keys: Key[]) => {
    setExpandedKeys([...keys]);
  };

  return (
    <div style={{ height: "250px", overflowY: "scroll", backgroundColor: "#f5f5f5" }}>
      {archiveExtractionStatus === "in_progress" ? (
        <Spin tip="Decompressing..." size="large" />
      ) : archiveExtractionStatus === "failed" ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <CloseCircleFilled
            style={{
              color: "#FF4D4F",
              fontSize: "56px",
              marginBottom: "28px",
            }}
          />
          <span
            style={{
              fontFamily: "Roboto",
              fontStyle: "normal",
              fontWeight: "400",
              fontSize: "14px",
              lineHeight: "22px",
              color: "rgba(0, 0, 0, 0.85)",
            }}>
            Fail to decompress, please check your file
          </span>
        </div>
      ) : (
        <Tree
          switcherIcon={<Icon icon="caretDown" />}
          expandedKeys={[...expandedKeys]}
          selectedKeys={[...selectedKeys]}
          onSelect={onSelect}
          onExpand={onExpand}
          treeData={treeData}
          multiple={false}
          showLine
        />
      )}
    </div>
  );
};

export default UnzipFileList;
