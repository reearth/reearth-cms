import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import { useT } from "@reearth-cms/i18n";

import UploadModal from "../UploadModal/UploadModal";

type Props = {
  alsoLink?: boolean;
  uploadProps: UploadProps;
  fileList: UploadFile<File>[];
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: string;
  setUploadUrl: (url: string) => void;
  displayUploadModal: () => void;
  hideUploadModal: () => void;
  handleUpload: () => void;
};

const UploadAsset: React.FC<Props> = ({
  alsoLink,
  uploadProps,
  fileList,
  uploading,
  uploadModalVisibility,
  displayUploadModal,
  hideUploadModal,
  uploadUrl,
  setUploadUrl,
  handleUpload,
}) => {
  const t = useT();
  return (
    <>
      <Button type="primary" icon={<Icon icon="upload" />} onClick={displayUploadModal}>
        {t("Upload Asset")}
      </Button>
      <UploadModal
        alsoLink={alsoLink}
        uploadProps={uploadProps}
        fileList={fileList}
        uploading={uploading}
        uploadUrl={uploadUrl}
        setUploadUrl={setUploadUrl}
        handleUpload={handleUpload}
        visible={uploadModalVisibility}
        handleCancel={hideUploadModal}
      />
    </>
  );
};

export default UploadAsset;
