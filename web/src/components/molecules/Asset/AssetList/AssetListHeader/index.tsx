import styled from "@emotion/styled";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import { UploadChangeParam, UploadFile } from "antd/lib/upload/interface";

type AssetListHeaderProps = {
  title: string;
  subTitle: string;
  handleUpload: (info: UploadChangeParam<UploadFile<any>>) => void;
};

const AssetListHeader: React.FC<AssetListHeaderProps> = ({
  title,
  subTitle,
  handleUpload,
}) => {
  return (
    <AssetListHeaderWrapper>
      <HeaderTitleWrapper>
        <HeaderTitle>{title}</HeaderTitle>
        <HeaderSubTitle>{subTitle}</HeaderSubTitle>
      </HeaderTitleWrapper>
      <UploadAsset
        multiple={false}
        directory={false}
        showUploadList={false}
        accept="image/*,.zip,.json,.geojson,.topojson,.shapefile,.kml,.czml,.glb"
        onChange={handleUpload}
      />
    </AssetListHeaderWrapper>
  );
};

const AssetListHeaderWrapper = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitleWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const HeaderTitle = styled.h1`
  margin: 0 16px 0 0;
`;

const HeaderSubTitle = styled.h3`
  margin: 0;
`;

export default AssetListHeader;
