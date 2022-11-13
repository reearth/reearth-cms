import styled from "@emotion/styled";
import { createWorldTerrain, Viewer } from "cesium";

import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import { DefaultOptionType } from "@reearth-cms/components/atoms/Select";
import TilesetPreview from "@reearth-cms/components/atoms/TilesetPreview";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import Card from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/card";
import PreviewToolbar from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewToolbar";
import { PreviewType } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewTypeSelect";
import UnzipFileList from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/UnzipFileList";
import ViewerNotSupported from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/viewerNotSupported";
import { fileFormats, imageFormats } from "@reearth-cms/components/molecules/Common/Asset";
import { getExtension } from "@reearth-cms/utils/file";

import useHooks from "./hooks";
import SVGPreview from "./svgPreview";

type Props = {
  asset: Asset;
  selectedPreviewType: PreviewType;
  isModalVisible: boolean;
  handleModalCancel: () => void;
  handleFullScreen: () => void;
  handleTypeChange: (
    value: PreviewType,
    option: DefaultOptionType | DefaultOptionType[],
  ) => void | undefined;
};

export let viewerRef: Viewer | undefined;

const AssetBody: React.FC<Props> = ({
  asset,
  selectedPreviewType,
  isModalVisible,
  handleModalCancel,
  handleFullScreen,
}) => {
  const { svgRender, handleCodeSourceClick, handleRenderClick } = useHooks();
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
              url: asset.url,
            }}
            onGetViewer={getViewer}
          />
        );
      case selectedPreviewType === "IMAGE" && imageFormats.includes(assetFileExt):
        return isSVG ? (
          <SVGPreview url={asset.url} svgRender={svgRender} />
        ) : (
          <Image src={asset.url} alt="asset-preview" />
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
              url={asset.url}
              selectedPreviewType={selectedPreviewType}
              isModalVisible={isModalVisible}
              isSVG={isSVG}
              handleCodeSourceClick={handleCodeSourceClick}
              handleRenderClick={handleRenderClick}
              handleFullScreen={handleFullScreen}
              handleModalCancel={handleModalCancel}
            />
          }>
          {renderPreview()}
        </Card>
        {displayUnzipFileList && (
          <Card title={asset.fileName}>
            <UnzipFileList
              file={asset.file}
              style={{ height: "250px", overflowY: "scroll", backgroundColor: "#f5f5f5" }}
            />
          </Card>
        )}
        <DownloadButton type="ghost" filename={asset.fileName} url={asset.url} displayDefaultIcon />
      </BodyWrapper>
    </BodyContainer>
  );
};

const BodyContainer = styled.div`
  padding: 16px 24px;
  display: flex;
  flex-direction: row;
  .ant-tree-show-line .ant-tree-switcher {
    background-color: transparent;
  }
`;

const BodyWrapper = styled.div`
  padding: 16px 24px;
  width: 70%;
`;

const Image = styled.img`
  width: 100%;
  height: 500px;
  object-fit: contain;
`;

export default AssetBody;
