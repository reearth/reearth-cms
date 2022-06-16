import styled from "@emotion/styled";
import TilesetPreview from "@reearth-cms/components/atoms/TilesetPreview";
import Card from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/card";
import SideBarCard from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/side-bar-card";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { createWorldTerrain } from "cesium";
import moment from "moment";

type AssetBodyProps = { asset: Asset };

const AssetBody: React.FC<AssetBodyProps> = ({ asset }) => {
  const { name, url, contentType, createdAt, createdBy } = asset;
  const displayImage = contentType !== "GIS/3DTiles";
  const formatDate = (date: Date) => {
    return moment(date).format("YYYY-MM-DD hh:mm");
  };

  const formattedCreatedAt = formatDate(createdAt);

  return (
    <BodyContainer>
      <BodyWrapper>
        <Card title={name} style={{ marginBottom: "24px" }}>
          {displayImage ? (
            <Image src={url} alt="asset-preview"></Image>
          ) : (
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
          )}
        </Card>
        <Card title="Unzip File">
          <div style={{ minHeight: "400px" }}></div>
        </Card>
      </BodyWrapper>
      <SideBarWrapper>
        <SideBarCard title="Asset Type">{contentType}</SideBarCard>
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
