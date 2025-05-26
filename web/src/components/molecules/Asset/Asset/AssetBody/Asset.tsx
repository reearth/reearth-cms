import styled from "@emotion/styled";
import { Viewer as CesiumViewer } from "cesium";
import { useMemo, useState, useRef, RefObject } from "react";
import { CesiumComponentRef } from "resium";

import Button from "@reearth-cms/components/atoms/Button";
import CopyButton from "@reearth-cms/components/atoms/CopyButton";
import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import Icon from "@reearth-cms/components/atoms/Icon";
import Card from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/card";
import PreviewToolbar from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewToolbar";
import {
  PreviewType,
  PreviewTypeSelect,
} from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewTypeSelect";
import SideBarCard from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/sideBarCard";
import UnzipFileList from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/UnzipFileList";
import ViewerNotSupported from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/viewerNotSupported";
import ArchiveExtractionStatus from "@reearth-cms/components/molecules/Asset/AssetListTable/ArchiveExtractionStatus";
import { Asset, AssetItem, ViewerType } from "@reearth-cms/components/molecules/Asset/types";
import {
  GeoViewer,
  Geo3dViewer,
  SvgViewer,
  ImageViewer,
  GltfViewer,
  CsvViewer,
  MvtViewer,
} from "@reearth-cms/components/molecules/Asset/Viewers";
import GeoJSONViewer from "@reearth-cms/components/molecules/Asset/Viewers/GeoJSONViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";
import { getExtension } from "@reearth-cms/utils/file";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";

import useHooks from "./hooks";

type Props = {
  asset: Asset;
  assetFileExt?: string;
  selectedPreviewType?: PreviewType;
  isModalVisible: boolean;
  viewerType?: ViewerType;
  displayUnzipFileList: boolean;
  decompressing: boolean;
  hasUpdateRight: boolean;
  onAssetItemSelect: (item: AssetItem) => void;
  onAssetDecompress: (assetId: string) => void;
  onAssetDownload: (asset: Asset) => Promise<void>;
  onModalCancel: () => void;
  onTypeChange: (value: PreviewType) => void;
  onChangeToFullScreen: (viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>) => void;
  workspaceSettings: WorkspaceSettings;
};

const AssetMolecule: React.FC<Props> = ({
  asset,
  assetFileExt,
  selectedPreviewType,
  isModalVisible,
  viewerType,
  displayUnzipFileList,
  decompressing,
  hasUpdateRight,
  onAssetItemSelect,
  onAssetDecompress,
  onAssetDownload,
  onTypeChange,
  onModalCancel,
  onChangeToFullScreen,
  workspaceSettings,
}) => {
  const t = useT();
  const { svgRender, handleCodeSourceClick, handleRenderClick } = useHooks();
  const [assetUrl, setAssetUrl] = useState(asset.url);
  const assetBaseUrl = asset.url.slice(0, asset.url.lastIndexOf("/"));
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);

  const viewerComponent = useMemo(() => {
    switch (viewerType) {
      case "geo": {
        const ext = getExtension(assetUrl) ?? assetFileExt;
        if (ext === "geojson") {
          return (
            <GeoJSONViewer
              assetFileExt={assetFileExt}
              isAssetPublic={asset.public}
              url={assetUrl}
              workspaceSettings={workspaceSettings}
              viewerRef={viewerRef}
            />
          );
        }
        return (
          <GeoViewer
            assetFileExt={assetFileExt}
            isAssetPublic={asset.public}
            url={assetUrl}
            workspaceSettings={workspaceSettings}
            viewerRef={viewerRef}
          />
        );
      }
      case "geo_3d_tiles":
        return (
          <Geo3dViewer
            isAssetPublic={asset.public}
            url={assetUrl}
            setAssetUrl={setAssetUrl}
            workspaceSettings={workspaceSettings}
            viewerRef={viewerRef}
          />
        );
      case "geo_mvt":
        return (
          <MvtViewer
            isAssetPublic={asset.public}
            url={assetUrl}
            workspaceSettings={workspaceSettings}
            viewerRef={viewerRef}
          />
        );
      case "image":
        return <ImageViewer isAssetPublic={asset.public} url={assetUrl} />;
      case "image_svg":
        return <SvgViewer isAssetPublic={asset.public} svgRender={svgRender} url={assetUrl} />;
      case "model_3d":
        return (
          <GltfViewer
            isAssetPublic={asset.public}
            url={assetUrl}
            workspaceSettings={workspaceSettings}
            viewerRef={viewerRef}
          />
        );
      case "csv":
        return (
          <CsvViewer
            isAssetPublic={asset.public}
            url={assetUrl}
            workspaceSettings={workspaceSettings}
            viewerRef={viewerRef}
          />
        );
      case "unknown":
      default:
        return <ViewerNotSupported />;
    }
  }, [asset.public, assetFileExt, assetUrl, viewerRef, svgRender, viewerType, workspaceSettings]);

  return (
    <BodyContainer>
      <BodyWrapper>
        <Card
          title={
            <>
              <AssetName>{asset.fileName}</AssetName>
              <Buttons>
                <CopyButton
                  copyable={{ text: asset.url, tooltips: [t("Copy URL"), t("URL copied!!")] }}
                  size={16}
                />
                <DownloadButton
                  disabled={!asset}
                  onlyIcon
                  onDownload={() => onAssetDownload(asset)}
                />
              </Buttons>
            </>
          }
          toolbar={
            <PreviewToolbar
              url={assetUrl}
              isModalVisible={isModalVisible}
              viewerType={viewerType}
              viewerRef={viewerRef}
              onCodeSourceClick={handleCodeSourceClick}
              onRenderClick={handleRenderClick}
              onFullScreen={onChangeToFullScreen}
              onModalCancel={onModalCancel}
            />
          }>
          {viewerComponent}
        </Card>
        {displayUnzipFileList && asset.file && (
          <Card
            title={asset.fileName}
            toolbar={
              <>
                <ArchiveExtractionStatus archiveExtractionStatus={asset.archiveExtractionStatus} />
                {asset.archiveExtractionStatus === "SKIPPED" && (
                  <UnzipButton
                    onClick={() => onAssetDecompress(asset.id)}
                    loading={decompressing}
                    icon={<Icon icon="unzip" />}>
                    {t("Unzip")}
                  </UnzipButton>
                )}
              </>
            }>
            <UnzipFileList
              file={asset.file}
              assetBaseUrl={assetBaseUrl}
              archiveExtractionStatus={asset.archiveExtractionStatus}
              setAssetUrl={setAssetUrl}
            />
          </Card>
        )}
        <DownloadButton
          disabled={!asset}
          displayDefaultIcon
          onDownload={() => onAssetDownload(asset)}
        />
      </BodyWrapper>
      <SideBarWrapper>
        <SideBarCard title={t("Asset Type")}>
          <PreviewTypeSelect
            value={selectedPreviewType}
            onTypeChange={onTypeChange}
            hasUpdateRight={hasUpdateRight}
          />
        </SideBarCard>
        <SideBarCard title={t("Asset Information")}>
          <AssetInfo>
            <InfoRow>
              <InfoKey>ID</InfoKey>
              <ID>{asset.id}</ID>
            </InfoRow>
            <InfoRow>
              <InfoKey>{t("Created at")}</InfoKey>
              <InfoValue>{dateTimeFormat(asset.createdAt)}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoKey>{t("Created by")}</InfoKey>
              <InfoValue>{asset.createdBy?.name}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoKey>{t("Size")}</InfoKey>
              <InfoValue>{bytesFormat(asset.size)}</InfoValue>
            </InfoRow>
          </AssetInfo>
        </SideBarCard>
        <SideBarCard title={t("Linked to")}>
          {asset.items.map(item => (
            <div key={item.itemId}>
              <StyledButton type="link" onClick={() => onAssetItemSelect(item)}>
                {item.itemId}
              </StyledButton>
            </div>
          ))}
        </SideBarCard>
      </SideBarWrapper>
    </BodyContainer>
  );
};

const AssetName = styled.span`
  min-width: 0;
  word-wrap: break-word;
`;

const Buttons = styled.div`
  display: flex;
  gap: 12px;
`;

const UnzipButton = styled(Button)`
  margin-left: 24px;
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 72px);
  border-top: 1px solid #00000008;
  .ant-tree-show-line .ant-tree-switcher {
    background-color: transparent;
  }
`;

const BodyWrapper = styled.div`
  padding: 16px 24px;
  width: 70%;
  height: 100%;
  overflow-y: auto;
  flex: 1;
`;

const SideBarWrapper = styled.div`
  padding: 8px;
  width: 272px;
  background-color: #fafafa;
`;

const StyledButton = styled(Button)`
  padding: 0;
`;

const AssetInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  line-height: 28px;
`;

const InfoKey = styled.p`
  font-size: 14px;
  margin: 0;
  flex-shrink: 0;
`;

const InfoValue = styled.p`
  font-size: 12px;
  margin: 0;
  padding: 0px 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #8c8c8c;
`;

const ID = styled(InfoValue)`
  color: #848484;
  background-color: #f0f0f0;
  border-radius: 4px;
`;

export default AssetMolecule;
