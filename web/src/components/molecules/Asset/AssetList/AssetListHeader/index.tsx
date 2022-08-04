import styled from "@emotion/styled";

import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";

type Props = {
  title: string;
  subTitle: string;
  fileList: UploadFile<any>[];
  uploading: boolean;
  uploadProps: UploadProps;
  uploadModalVisibility: boolean;
  displayUploadModal: () => void;
  hideUploadModal: () => void;
  handleUpload: () => void;
};

const AssetListHeader: React.FC<Props> = ({
  title,
  subTitle,
  fileList,
  uploading,
  uploadProps,
  handleUpload,
  uploadModalVisibility,
  displayUploadModal,
  hideUploadModal,
}) => {
  return (
    <AssetListHeaderWrapper>
      <HeaderTitleWrapper>
        <HeaderTitle>{title}</HeaderTitle>
        <HeaderSubTitle>{subTitle}</HeaderSubTitle>
      </HeaderTitleWrapper>
      <UploadAsset
        fileList={fileList}
        uploading={uploading}
        uploadProps={uploadProps}
        uploadModalVisibility={uploadModalVisibility}
        displayUploadModal={displayUploadModal}
        hideUploadModal={hideUploadModal}
        handleUpload={handleUpload}
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
