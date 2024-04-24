import styled from "@emotion/styled";
import { Key } from "rc-table/lib/interface";
import { useCallback, useEffect, useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Spin from "@reearth-cms/components/atoms/Spin";
import Tree, { TreeProps } from "@reearth-cms/components/atoms/Tree";
import { ArchiveExtractionStatus, AssetFile } from "@reearth-cms/components/molecules/Asset/types";
import { useT } from "@reearth-cms/i18n";

import { generateAssetTreeData } from "./generateAssetTreeData";
import { FileNode } from "./types";

type Props = {
  file: AssetFile;
  assetBaseUrl: string;
  archiveExtractionStatus: ArchiveExtractionStatus;
  setAssetUrl: (url: string) => void;
};

const UnzipFileList: React.FC<Props> = ({
  file,
  assetBaseUrl,
  archiveExtractionStatus,
  setAssetUrl,
}) => {
  const t = useT();

  const [expandedKeys, setExpandedKeys] = useState<FileNode["key"][]>(["0-0"]);
  const [selectedKeys, setSelectedKeys] = useState<FileNode["key"][]>([]);
  const [treeData, setTreeData] = useState<FileNode[]>([]);

  useEffect(() => {
    const data = generateAssetTreeData(file, selectedKeys, assetBaseUrl);
    setTreeData(data);
  }, [assetBaseUrl, file, selectedKeys]);

  const previewFile = useCallback(
    (path: string) => {
      setAssetUrl(assetBaseUrl + path);
    },
    [assetBaseUrl, setAssetUrl],
  );

  const handleSelect: TreeProps<FileNode>["onSelect"] = useCallback(
    (keys: Key[], { node: { path } }: { node: FileNode }) => {
      if (!keys[0] || keys[0] === selectedKeys[0]) return;
      previewFile(path);
      setSelectedKeys(keys);
    },
    [previewFile, selectedKeys],
  );

  const handleExpand: TreeProps["onExpand"] = (keys: Key[]) => {
    setExpandedKeys([...keys]);
  };

  return (
    <UnzipFileListWrapper>
      {archiveExtractionStatus === "IN_PROGRESS" || archiveExtractionStatus === "PENDING" ? (
        <ExtractionInProgressWrapper>
          <Spin tip={t("Decompressing...")} size="large" />
        </ExtractionInProgressWrapper>
      ) : archiveExtractionStatus === "FAILED" ? (
        <ExtractionFailedWrapper>
          <ExtractionFailedIcon icon="closeCircle" color="#FF4D4F" size="56px" />
          <ExtractionFailedText>
            {t("Failed to decompress. Please check the file and try again.")}
          </ExtractionFailedText>
        </ExtractionFailedWrapper>
      ) : (
        <Tree
          switcherIcon={<Icon icon="caretDown" />}
          expandedKeys={[...expandedKeys]}
          selectedKeys={[...selectedKeys]}
          onSelect={handleSelect}
          onExpand={handleExpand}
          treeData={treeData}
          multiple={false}
          showLine
        />
      )}
    </UnzipFileListWrapper>
  );
};

const UnzipFileListWrapper = styled.div`
  height: 250px;
  overflow-y: scroll;
  background-color: #f5f5f5;
`;

const ExtractionInProgressWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const ExtractionFailedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const ExtractionFailedIcon = styled(Icon)`
  margin-bottom: 28px;
`;

const ExtractionFailedText = styled.p`
  margin-bottom: 0;
  font-family: Roboto;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
`;

export default UnzipFileList;
