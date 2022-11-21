import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { useT } from "@reearth-cms/i18n";

import UploadModal from "../UploadModal/UploadModal";

type Props = {
  alsoLink?: boolean;
  uploadProps: UploadProps;
  fileList: UploadFile<File>[];
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: string;
  uploadType: UploadType;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
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
  uploadType,
  setUploadUrl,
  setUploadType,
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
        uploadType={uploadType}
        setUploadUrl={setUploadUrl}
        setUploadType={setUploadType}
        handleUpload={handleUpload}
        visible={uploadModalVisibility}
        handleCancel={hideUploadModal}
      />
    </>
  );
};

export default UploadAsset;
