import styled from "@emotion/styled";
import { Key } from "rc-table/lib/interface";
import { useCallback, useEffect, useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Spin from "@reearth-cms/components/atoms/Spin";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
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

  const handleCopy = useCallback(
    (path: string) => {
      navigator.clipboard.writeText(assetBaseUrl + path);
    },
    [assetBaseUrl],
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
            switcherIcon={<Icon icon="caretDown" />}
            defaultExpandedKeys={["0-0"]}
            selectedKeys={selectedKeys}
            onSelect={handleSelect}
            treeData={treeData}
            multiple={false}
            showLine
            titleRender={({ title, key, path }) => {
              return (
                <>
                  {title}
                  {selectedKeys[0] === key && (
                    <Tooltip title={t("URL copied!!")} trigger={"click"}>
                      <CopyIcon icon="copy" onClick={() => handleCopy(path)} />
                    </Tooltip>
                  )}
                </>
              );
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

const CopyIcon = styled(Icon)`
  margin-left: 6px;
  transition: all 0.3s;
  color: rgb(0, 0, 0, 0.45);
  :hover {
    color: rgba(0, 0, 0, 0.88);
  }
`;

export default UnzipFileList;
