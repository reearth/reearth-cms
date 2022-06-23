import styled from "@emotion/styled";
import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import TilesetPreview from "@reearth-cms/components/atoms/TilesetPreview";
import {
  AssetType,
  AssetTypeSelect,
} from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/asset-type-select";
import Card from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/card";
import NoSupportedViewer from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/NoSupportedViewer";
import PreviewToolbar from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/preview-toolbar";
import SideBarCard from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/side-bar-card";
import SVGPreview from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/svg-preview";
import UnzipFileList from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/unzip-file-list";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { dateTimeFormat } from "@reearth-cms/utils/format";
import { DefaultOptionType } from "antd/lib/select";
import { createWorldTerrain, Viewer } from "cesium";

import useHooks from "./hooks";

type AssetBodyProps = {
  asset: Asset;
  selectedContentType: string;
  isModalVisible: boolean;
  handleModalCancel: () => void;
  handleFullScreen: () => void;
  handleTypeChange: (
    value: AssetType,
    option: DefaultOptionType | DefaultOptionType[]
  ) => void | undefined;
};

export let viewerRef: Viewer | undefined;

const AssetBody: React.FC<AssetBodyProps> = ({
  asset,
  selectedContentType,
  handleTypeChange,
  isModalVisible,
  handleModalCancel,
  handleFullScreen,
}) => {
  const { name, url, createdAt, createdBy } = asset;
  const { svgRender, handleCodeSourceClick, handleRenderClick } = useHooks();
  const formattedCreatedAt = dateTimeFormat(createdAt);
  const displayUnzipFileList = selectedContentType === AssetType.ZIP;
  const getViewer = (viewer: Viewer | undefined) => {
    viewerRef = viewer;
  };

  const renderPreview = () => {
    switch (selectedContentType) {
      case AssetType.JSON:
      case AssetType.ZIP:
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
          ></TilesetPreview>
        );
      case AssetType.JPEG:
      case AssetType.PNG:
        return (
          // TODO: this is a hardcoded url and should be replaced with asset.url
          <Image
            src="https://via.placeholder.com/640x480.png?text=No+Image"
            alt="asset-preview"
          ></Image>
        );
      case AssetType.SVG:
        // TODO: this is a hardcoded url and should be replaced with asset.url
        return (
          <SVGPreview
            url="https://assets.codepen.io/3/kiwi.svg"
            svgRender={svgRender}
          />
        );
      default:
        return <NoSupportedViewer />;
    }
  };

  return (
    <BodyContainer>
      <BodyWrapper>
        <Card
          title={name}
          toolbar={
            <PreviewToolbar
              url={url}
              selectedContentType={selectedContentType}
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
          filename={asset.name}
          url={asset.url}
          displayDefaultIcon={true}
        ></DownloadButton>
      </BodyWrapper>
      <SideBarWrapper>
        <SideBarCard title="Asset Type">
          <AssetTypeSelect
            style={{ width: "60%" }}
            value={selectedContentType as AssetType}
            onTypeChange={handleTypeChange}
          />
        </SideBarCard>
        <SideBarCard title="Created Time">{formattedCreatedAt}</SideBarCard>
        <SideBarCard title="Created By">{createdBy}</SideBarCard>
      </SideBarWrapper>
    </BodyContainer>
  );
};

const BodyContainer = styled("div")`
  padding: 16px 24px;
  display: flex;
  flex-direction: row;
`;

const BodyWrapper = styled("div")`
  padding: 16px 24px;
  width: 70%;
`;

const Image = styled("img")`
  width: Auto;
  height: 500px;
  object-fit: contain;
`;

const SideBarWrapper = styled("div")`
  padding: 8px;
  width: 30%;
  display: flex;
  flex-direction: column;
`;

export default AssetBody;
