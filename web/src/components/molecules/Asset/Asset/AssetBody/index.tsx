import styled from "@emotion/styled";
import { createWorldTerrain, Viewer } from "cesium";

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
import UnzipFileList from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/unzipFileList";
import ViewerNotSupported from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/viewerNotSupported";
import { dateTimeFormat } from "@reearth-cms/utils/format";

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
  handleTypeChange,
  isModalVisible,
  handleModalCancel,
  handleFullScreen,
}) => {
  const { svgRender, handleCodeSourceClick, handleRenderClick } = useHooks();
  const formattedCreatedAt = dateTimeFormat(asset.createdAt);
  const displayUnzipFileList = selectedPreviewType !== "IMAGE";
  // TODO: maybe we need a better way to check for svg files
  const isSVG = !!asset.fileName?.endsWith(".svg");
  const getViewer = (viewer: Viewer | undefined) => {
    viewerRef = viewer;
  };
  const renderPreview = () => {
    switch (selectedPreviewType) {
      case "GEO":
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
      case "IMAGE":
        return isSVG ? (
          <SVGPreview url={asset.url} svgRender={svgRender} />
        ) : (
          <Image src={asset.url} alt="asset-preview"></Image>
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
          <Card title="Unzip File">
            <UnzipFileList style={{ minHeight: "400px" }}></UnzipFileList>
          </Card>
        )}
        <DownloadButton type="ghost" filename={asset.fileName} url={asset.url} displayDefaultIcon />
      </BodyWrapper>
      <SideBarWrapper>
        <SideBarCard title="Asset Type">
          <PreviewTypeSelect
            style={{ width: "75%" }}
            value={selectedPreviewType}
            onTypeChange={handleTypeChange}
          />
        </SideBarCard>
        <SideBarCard title="Created Time">{formattedCreatedAt}</SideBarCard>
        <SideBarCard title="Created By">{asset.createdBy}</SideBarCard>
      </SideBarWrapper>
    </BodyContainer>
  );
};

const BodyContainer = styled.div`
  padding: 16px 24px;
  display: flex;
  flex-direction: row;
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

const SideBarWrapper = styled.div`
  padding: 8px;
  width: 30%;
  display: flex;
  flex-direction: column;
`;

export default AssetBody;
