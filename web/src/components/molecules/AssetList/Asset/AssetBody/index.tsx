import styled from "@emotion/styled";
import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import TilesetPreview from "@reearth-cms/components/atoms/TilesetPreview";
import {
  AssetType,
  AssetTypeSelect,
} from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/asset-type-select";
import Card from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/card";
import SideBarCard from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/side-bar-card";
import UnzipFileList from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/unzip-file-list";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { DefaultOptionType } from "antd/lib/select";
import { createWorldTerrain } from "cesium";
import moment from "moment";

type AssetBodyProps = {
  asset: Asset;
  selectedContentType: string;
  displayPreview: boolean;
  displayUnzipFileList: boolean;
  handleTypeChange: (
    value: AssetType,
    option: DefaultOptionType | DefaultOptionType[]
  ) => void | undefined;
};

const AssetBody: React.FC<AssetBodyProps> = ({
  asset,
  selectedContentType,
  handleTypeChange,
  displayPreview,
  displayUnzipFileList,
}) => {
  const { name, url, createdAt, createdBy } = asset;

  const formatDate = (date: Date) => {
    return moment(date).format("YYYY-MM-DD hh:mm");
  };
  const formattedCreatedAt = formatDate(createdAt);

  return (
    <BodyContainer>
      <BodyWrapper>
        <Card title={name} style={{ marginBottom: "24px" }}>
          {displayPreview ? (
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
            ></TilesetPreview>
          ) : (
            <Image
              src="https://via.placeholder.com/640x480.png?text=No+Image"
              alt="asset-preview"
            ></Image>
          )}
        </Card>
        {displayUnzipFileList && (
          <Card title="Unzip File" style={{ marginBottom: "24px" }}>
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
  width: 100%;
  height: auto;
`;

const SideBarWrapper = styled("div")`
  padding: 8px;
  width: 30%;
  display: flex;
  flex-direction: column;
`;

export default AssetBody;
