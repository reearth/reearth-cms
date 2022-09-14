import styled from "@emotion/styled";
import { Dispatch, SetStateAction } from "react";

import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import { fileFormats, imageFormats } from "@reearth-cms/components/molecules/Common/Asset";

type Props = {
  title: string;
  subTitle: string;
  fileList: UploadFile<File>[];
  uploading: boolean;
  uploadModalVisibility: boolean;
  displayUploadModal: () => void;
  hideUploadModal: () => void;
  handleUpload: () => void;
  setFileList: Dispatch<SetStateAction<UploadFile<any>[]>>;
};

const AssetListHeader: React.FC<Props> = ({
  title,
  subTitle,
  fileList,
  uploading,
  uploadModalVisibility,
  displayUploadModal,
  hideUploadModal,
  handleUpload,
  setFileList,
}) => {
  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    directory: false,
    showUploadList: true,
    accept: imageFormats + "," + fileFormats,
    listType: "picture",
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (_file, files) => {
      setFileList([...fileList, ...files]);
      return false;
    },
    fileList,
  };

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
