import styled from "@emotion/styled";
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
import SVGPreview from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/svgPreview";
import UnzipFileList from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/unzipFileList";
import ViewerNotSupported from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/viewerNotSupported";
import { dateTimeFormat } from "@reearth-cms/utils/format";
import { createWorldTerrain, Viewer } from "cesium";

import useHooks from "./hooks";

type AssetBodyProps = {
  asset: Asset;
  url: string;
  selectedPreviewType: PreviewType;
  isModalVisible: boolean;
  handleModalCancel: () => void;
  handleFullScreen: () => void;
  handleTypeChange: (
    value: PreviewType,
    option: DefaultOptionType | DefaultOptionType[]
  ) => void | undefined;
};

export let viewerRef: Viewer | undefined;

const AssetBody: React.FC<AssetBodyProps> = ({
  asset,
  url,
  selectedPreviewType,
  handleTypeChange,
  isModalVisible,
  handleModalCancel,
  handleFullScreen,
}) => {
  const { fileName, createdAt, createdBy } = asset;
  const { svgRender, handleCodeSourceClick, handleRenderClick } = useHooks();
  const formattedCreatedAt = dateTimeFormat(createdAt);
  const displayUnzipFileList = selectedPreviewType === PreviewType.ZIP;
  const getViewer = (viewer: Viewer | undefined) => {
    viewerRef = viewer;
  };
  const renderPreview = () => {
    switch (selectedPreviewType) {
      case PreviewType.GEO:
      case PreviewType.ZIP:
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
              url: url,
            }}
            onGetViewer={getViewer}
          />
        );
      case PreviewType.IMAGE:
        return <Image src={url} alt="asset-preview"></Image>;
      case PreviewType.SVG:
        return <SVGPreview url={url} svgRender={svgRender} />;
      default:
        return <ViewerNotSupported />;
    }
  };

  return (
    <BodyContainer>
      <BodyWrapper>
        <Card
          title={fileName}
          toolbar={
            <PreviewToolbar
              url={url}
              selectedPreviewType={selectedPreviewType}
              isModalVisible={isModalVisible}
              handleCodeSourceClick={handleCodeSourceClick}
              handleRenderClick={handleRenderClick}
              handleFullScreen={handleFullScreen}
              handleModalCancel={handleModalCancel}
            />
          }
        >
          {renderPreview()}
        </Card>
        {displayUnzipFileList && (
          <Card title="Unzip File">
            <UnzipFileList style={{ minHeight: "400px" }}></UnzipFileList>
          </Card>
        )}
        <DownloadButton
          type="ghost"
          filename={fileName}
          url={url}
          displayDefaultIcon={true}
        />
      </BodyWrapper>
      <SideBarWrapper>
        <SideBarCard title="Asset Type">
          <PreviewTypeSelect
            style={{ width: "60%" }}
            value={selectedPreviewType}
            onTypeChange={handleTypeChange}
          />
        </SideBarCard>
        <SideBarCard title="Created Time">{formattedCreatedAt}</SideBarCard>
        <SideBarCard title="Created By">{createdBy?.name}</SideBarCard>
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
  width: Auto;
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
