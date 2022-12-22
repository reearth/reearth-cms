import styled from "@emotion/styled";
import { createWorldTerrain, Viewer } from "cesium";
import { useState } from "react";

import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import { DefaultOptionType } from "@reearth-cms/components/atoms/Select";
import TilesetPreview from "@reearth-cms/components/atoms/TilesetPreview";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { Asset, ViewerType } from "@reearth-cms/components/molecules/Asset/asset.type";
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
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import useHooks from "./hooks";
import SVGPreview from "./svgPreview";

type Props = {
  asset: Asset;
  selectedPreviewType: PreviewType;
  isModalVisible: boolean;
  viewerType: ViewerType;
  displayUnzipFileList: boolean;
  onModalCancel: () => void;
  onTypeChange: (
    value: PreviewType,
    option: DefaultOptionType | DefaultOptionType[],
  ) => void | undefined;
  onChangeToFullScreen: () => void;
};

export let viewerRef: Viewer | undefined;

const AssetMolecule: React.FC<Props> = ({
  asset,
  selectedPreviewType,
  isModalVisible,
  viewerType,
  displayUnzipFileList,
  onTypeChange,
  onModalCancel,
  onChangeToFullScreen,
}) => {
  const t = useT();
  const { svgRender, handleCodeSourceClick, handleRenderClick } = useHooks();
  const [assetUrl, setAssetUrl] = useState(asset.url);
  const assetBaseUrl = asset.url.slice(0, asset.url.lastIndexOf("/"));
  const formattedCreatedAt = dateTimeFormat(asset.createdAt);
  const getViewer = (viewer: Viewer | undefined) => {
    viewerRef = viewer;
  };
  const renderPreview = () => {
    switch (true) {
      case viewerType === "cesium":
        return (
          <TilesetPreview
            viewerProps={{
              terrainProvider: createWorldTerrain(),
              navigationHelpButton: false,
              homeButton: false,
              projectionPicker: false,
              sceneModePicker: false,
              baseLayerPicker: false,
              fullscreenButton: false,
              vrButton: false,
              selectionIndicator: false,
              timeline: false,
              animation: false,
              geocoder: false,
              shouldAnimate: true,
            }}
            tilesetProps={{
              url: assetUrl,
            }}
            onGetViewer={getViewer}
          />
        );
      case viewerType === "image":
        return <Image src={assetUrl} alt="asset-preview" />;
      case viewerType === "svg":
        return <SVGPreview url={assetUrl} svgRender={svgRender} />;
      case viewerType === "unsupported":
      default:
        return <ViewerNotSupported />;
    }
  };

  return (
    <BodyContainer>
      <BodyWrapper>
        <Card
          title={asset.fileName}
          toolbar={
            <PreviewToolbar
              url={assetUrl}
              isModalVisible={isModalVisible}
              viewerType={viewerType}
              handleCodeSourceClick={handleCodeSourceClick}
              handleRenderClick={handleRenderClick}
              handleFullScreen={onChangeToFullScreen}
              handleModalCancel={onModalCancel}
            />
          }>
          {renderPreview()}
        </Card>
        {displayUnzipFileList && (
          <Card
            title={asset.fileName}
            toolbar={
              <ArchiveExtractionStatus archiveExtractionStatus={asset.archiveExtractionStatus} />
            }>
            <UnzipFileList
              file={asset.file}
              assetBaseUrl={assetBaseUrl}
              archiveExtractionStatus={asset.archiveExtractionStatus}
              setAssetUrl={setAssetUrl}
            />
          </Card>
        )}
        <DownloadButton type="ghost" selected={asset ? [asset] : undefined} displayDefaultIcon />
      </BodyWrapper>
      <SideBarWrapper>
        <SideBarCard title={t("Asset Type")}>
          <PreviewTypeSelect
            style={{ width: "75%" }}
            value={selectedPreviewType}
            onTypeChange={onTypeChange}
          />
        </SideBarCard>
        <SideBarCard title={t("Created Time")}>{formattedCreatedAt}</SideBarCard>
        <SideBarCard title={t("Created By")}>
          <UserAvatar username={asset.createdBy} />
        </SideBarCard>
      </SideBarWrapper>
    </BodyContainer>
  );
};

const BodyContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 72px);
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

const Image = styled.img`
  width: 100%;
  height: 500px;
  object-fit: contain;
`;

const SideBarWrapper = styled.div`
  padding: 8px;
  width: 272px;
`;

export default AssetMolecule;
