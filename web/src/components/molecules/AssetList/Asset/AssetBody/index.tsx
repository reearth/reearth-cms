import styled from "@emotion/styled";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { Viewer, Cesium3DTileset } from "cesium";
import moment from "moment";
import {
  Viewer as ResiumViewer,
  Cesium3DTileset as Resium3DTileset,
} from "resium";

type AssetBodyProps = { asset: Asset };

const AssetBody: React.FC<AssetBodyProps> = ({ asset }) => {
  const { name, url, contentType, createdAt, createdBy } = asset;
  const displayImage = contentType !== "GIS/3DTiles";
  const formatDate = (date: Date) => {
    return moment(date).format("YYYY-MM-DD hh:mm");
  };

  const formattedCreatedAt = formatDate(createdAt);

  let viewer: Viewer | undefined; // This will be raw Cesium's Viewer object.

  const handleReady = async (tileset: Cesium3DTileset) => {
    try {
      await viewer?.zoomTo(tileset.root.tileset);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <BodyContainer>
      <BodyWrapper>
        <PreviewWrapper>
          <PreviewHeaderWrapper>
            <h5>{name}</h5>
          </PreviewHeaderWrapper>
          <PreviewImageWrapper>
            {displayImage ? (
              <Image src={url} alt="asset-preview"></Image>
            ) : (
              <ResiumViewer
                ref={(e) => {
                  viewer = e?.cesiumElement;
                }}
                navigationHelpButton={false}
                homeButton={false}
                projectionPicker={false}
                sceneModePicker={false}
                baseLayerPicker={false}
                fullscreenButton={false}
                vrButton={false}
                selectionIndicator={false}
                timeline={false}
                animation={false}
                geocoder={false}
              >
                <Resium3DTileset url={url} onReady={handleReady} />
              </ResiumViewer>
            )}
          </PreviewImageWrapper>
        </PreviewWrapper>
      </BodyWrapper>
      <SideBarWrapper>
        <SideBarCard>
          <CardTitle>Asset Type</CardTitle>
          <CardValue>{contentType}</CardValue>
        </SideBarCard>
        <SideBarCard>
          <CardTitle>Created Time</CardTitle>
          <CardValue>{formattedCreatedAt}</CardValue>
        </SideBarCard>
        <SideBarCard>
          <CardTitle>Created By</CardTitle>
          <CardValue>{createdBy}</CardValue>
        </SideBarCard>
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

const PreviewWrapper = styled("div")`
  padding: 0;
`;

const PreviewHeaderWrapper = styled("div")`
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 24px;
`;

const PreviewImageWrapper = styled("div")`
  padding: 10px;
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

const SideBarCard = styled("div")`
  padding: 12px;
  margin-bottom: 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 4px 0 #00000025;
`;

const CardTitle = styled("span")`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 4px;
`;

const CardValue = styled("span")`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.85);
`;

export default AssetBody;
