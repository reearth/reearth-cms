import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";

import UploadModal from "../UploadModal/uploadModal";

type Props = {
  uploadProps: UploadProps;
  fileList: UploadFile<File>[];
  uploading: boolean;
  uploadModalVisibility: boolean;
  displayUploadModal: () => void;
  hideUploadModal: () => void;
  handleUpload: () => void;
};

const UploadAsset: React.FC<Props> = ({
  uploadProps,
  fileList,
  uploading,
  uploadModalVisibility,
  displayUploadModal,
  hideUploadModal,
  handleUpload,
}) => {
  return (
    <>
      <Button type="primary" icon={<Icon icon="upload" />} onClick={displayUploadModal}>
        Upload Asset
      </Button>
      <UploadModal
        uploadProps={uploadProps}
        fileList={fileList}
        uploading={uploading}
        handleUpload={handleUpload}
        visible={uploadModalVisibility}
        handleCancel={hideUploadModal}
      />
    </>
  );
};

export default UploadAsset;
