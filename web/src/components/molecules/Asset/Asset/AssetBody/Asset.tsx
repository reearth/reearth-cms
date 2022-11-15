import styled from "@emotion/styled";
import { createWorldTerrain, Viewer } from "cesium";
import { useState } from "react";

import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import { DefaultOptionType } from "@reearth-cms/components/atoms/Select";
import TilesetPreview from "@reearth-cms/components/atoms/TilesetPreview";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import Card from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/card";
import PreviewToolbar from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewToolbar";
import {
  PreviewType,
  PreviewTypeSelect,
} from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewTypeSelect";
import SideBarCard from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/sideBarCard";
import UnzipFileList from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/UnzipFileList";
import ViewerNotSupported from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/viewerNotSupported";
import { fileFormats, imageFormats } from "@reearth-cms/components/molecules/Common/Asset";
import { useT } from "@reearth-cms/i18n";
import { getExtension } from "@reearth-cms/utils/file";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import useHooks from "./hooks";
import SVGPreview from "./svgPreview";

type Props = {
  asset: Asset;
  selectedPreviewType: PreviewType;
  isModalVisible: boolean;
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
  onTypeChange,
  onModalCancel,
  onChangeToFullScreen,
}) => {
  const t = useT();
  const { svgRender, handleCodeSourceClick, handleRenderClick } = useHooks();
  const [assetUrl, setAssetUrl] = useState(asset.url);
  const assetBaseUrl = assetUrl.slice(0, assetUrl.lastIndexOf("/"));
  const formattedCreatedAt = dateTimeFormat(asset.createdAt);
  const assetFileExt = getExtension(asset.fileName) ?? "";
  const displayUnzipFileList = assetFileExt === "zip";
  const isSVG = assetFileExt === "svg";
  const getViewer = (viewer: Viewer | undefined) => {
    viewerRef = viewer;
  };
  const renderPreview = () => {
    switch (true) {
      case (selectedPreviewType === "GEO" ||
        selectedPreviewType === "GEO3D" ||
        selectedPreviewType === "MODEL3D") &&
        fileFormats.includes(assetFileExt):
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
            }}
            tilesetProps={{
              url: assetUrl,
            }}
            onGetViewer={getViewer}
          />
        );
      case selectedPreviewType === "IMAGE" && imageFormats.includes(assetFileExt):
        return isSVG ? (
          <SVGPreview url={assetUrl} svgRender={svgRender} />
        ) : (
          <Image src={assetUrl} alt="asset-preview" />
        );
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
              selectedPreviewType={selectedPreviewType}
              isModalVisible={isModalVisible}
              isSVG={isSVG}
              handleCodeSourceClick={handleCodeSourceClick}
              handleRenderClick={handleRenderClick}
              handleFullScreen={onChangeToFullScreen}
              handleModalCancel={onModalCancel}
            />
          }>
          {renderPreview()}
        </Card>
        {displayUnzipFileList && (
          <Card title={asset.fileName}>
            <UnzipFileList
              file={asset.file}
              assetBaseUrl={assetBaseUrl}
              setAssetUrl={setAssetUrl}
              style={{ height: "250px", overflowY: "scroll", backgroundColor: "#f5f5f5" }}
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
        <SideBarCard title={t("Created By")}>{asset.createdBy}</SideBarCard>
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
