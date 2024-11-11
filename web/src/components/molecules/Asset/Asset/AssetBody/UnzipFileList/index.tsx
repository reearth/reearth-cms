import styled from "@emotion/styled";
import { Key } from "rc-table/lib/interface";
import { useCallback, useEffect, useState } from "react";

import CopyButton from "@reearth-cms/components/atoms/CopyButton";
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

  const [selectedKeys, setSelectedKeys] = useState<FileNode["key"][]>([]);
  const [treeData, setTreeData] = useState<FileNode[]>();

  useEffect(() => {
    const data = generateAssetTreeData(file);
    setTreeData(data);
  }, [file]);

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
        treeData && (
          <Tree
            switcherIcon={({ expanded }) => (
              <SwitcherIcon icon={expanded ? "folderOpen" : "folder"} size={14} />
            )}
            defaultExpandedKeys={["0-0"]}
            selectedKeys={selectedKeys}
            onSelect={handleSelect}
            treeData={treeData}
            multiple={false}
            showLine={{ showLeafIcon: true }}
            titleRender={({ title, key, path }) => {
              if (typeof title !== "function") {
                return (
                  <TitleWrapper>
                    <Title>{title}</Title>
                    {selectedKeys[0] === key && (
                      <CopyButton
                        copyable={{
                          text: assetBaseUrl + path,
                          tooltips: [t("Copy URL"), t("URL copied!!")],
                        }}
                      />
                    )}
                  </TitleWrapper>
                );
              }
            }}
          />
        )
      )}
    </UnzipFileListWrapper>
  );
};

const UnzipFileListWrapper = styled.div`
  height: 250px;
  overflow-y: scroll;
  background-color: #f5f5f5;
  .ant-tree-treenode {
    max-width: 100%;
  }
  .ant-tree-node-content-wrapper {
    min-width: 0;
  }
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

const TitleWrapper = styled.span`
  display: flex;
  gap: 6px;
`;

const Title = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SwitcherIcon = styled(Icon)`
  svg {
    transform: none !important;
  }
`;

export default UnzipFileList;
