import styled from "@emotion/styled";
import { createWorldTerrain, Viewer } from "cesium";

import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import { DefaultOptionType } from "@reearth-cms/components/atoms/Select";
import TilesetPreview from "@reearth-cms/components/atoms/TilesetPreview";
import Card from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/card";
import PreviewToolbar from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewToolbar";
import { PreviewTypeSelect } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewTypeSelect";
import SideBarCard from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/sideBarCard";
import UnzipFileList from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/unzipFileList";
import ViewerNotSupported from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/viewerNotSupported";
import { Asset, PreviewType } from "@reearth-cms/gql/graphql-client-api";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import useHooks from "./hooks";
import SVGPreview from "./svgPreview";

type Props = {
  asset: Asset;
  url: string;
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
  url,
  selectedPreviewType,
  handleTypeChange,
  isModalVisible,
  handleModalCancel,
  handleFullScreen,
}) => {
  const { svgRender, handleCodeSourceClick, handleRenderClick } = useHooks();
  const formattedCreatedAt = dateTimeFormat(asset?.createdAt);
  const displayUnzipFileList = selectedPreviewType !== PreviewType.Image;
  // TODO: maybe we need a better way to check for svg files
  const isSVG = asset?.fileName?.endsWith(".svg") ?? false;
  const getViewer = (viewer: Viewer | undefined) => {
    viewerRef = viewer;
  };
  const renderPreview = () => {
    switch (selectedPreviewType) {
      case PreviewType.Geo:
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
      case PreviewType.Image:
        return isSVG ? (
          <SVGPreview url={url} svgRender={svgRender} />
        ) : (
          <Image src={url} alt="asset-preview"></Image>
        );
      default:
        return <ViewerNotSupported />;
    }
  };

  return (
    <BodyContainer>
      <BodyWrapper>
        <Card
          title={asset?.fileName}
          toolbar={
            <PreviewToolbar
              url={url}
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
        <DownloadButton
          type="ghost"
          filename={asset?.fileName}
          url={url}
          displayDefaultIcon={true}
        />
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
        <SideBarCard title="Created By">{asset?.createdById}</SideBarCard>
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
