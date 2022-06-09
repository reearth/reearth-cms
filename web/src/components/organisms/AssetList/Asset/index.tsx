import styled from "@emotion/styled";
import AssetHeader from "@reearth-cms/components/molecules/AssetList/Asset/AssetHeader";
import { useParams } from "react-router-dom";

type Props = {};

const Asset: React.FC<Props> = () => {
  const { assetId } = useParams();
  const handleSave = () => { };
  return (
    <>
      <AssetHeader
        title={`Asset/${assetId}`}
        subTitle="This is a subtitle"
        handleSave={handleSave}
      />
      <AssetBodyContainer>
        <AssetBodyWrapper></AssetBodyWrapper>
        <AssetSideBarWrapper>
          <AssetSideBarCard>
            <CardTitle>Asset Type</CardTitle>
            <CardValue>GIS/3D</CardValue>
          </AssetSideBarCard>
          <AssetSideBarCard>
            <CardTitle>Created Time</CardTitle>
            <CardValue>4/12/2022 11:55</CardValue>
          </AssetSideBarCard>
          <AssetSideBarCard>
            <CardTitle>Created By</CardTitle>
            <CardValue>b.nour</CardValue>
          </AssetSideBarCard>
        </AssetSideBarWrapper>
      </AssetBodyContainer>
    </>
  );
};

const AssetBodyContainer = styled("div")`
  padding: 16px 24px;
  display: flex;
  flex-direction: row;
`;

const AssetBodyWrapper = styled("div")`
  padding: 16px 24px;
  width: 75%;
`;

const AssetSideBarWrapper = styled("div")`
  padding: 8px;
  width: 25%;
  display: flex;
  flex-direction: column;
`;

const AssetSideBarCard = styled("div")`
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

export default Asset;
