import { AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { useT } from "@reearth-cms/i18n";

import UploadModal from "../UploadModal/UploadModal";

type Props = {
  alertList?: AlertProps[];
  alsoLink?: boolean;
  displayUploadModal: () => void;
  fileList?: UploadFile<File>[];
  hasCreateRight: boolean;
  onUpload: () => void;
  onUploadModalCancel?: () => void;
  onUploadModalClose?: () => void;
  setUploadType?: (type: UploadType) => void;
  setUploadUrl: (uploadUrl: { autoUnzip: boolean; url: string; }) => void;
  uploading?: boolean;
  uploadModalVisibility?: boolean;
  uploadProps: UploadProps;
  uploadType?: UploadType;
  uploadUrl: { autoUnzip: boolean; url: string; };
};

const UploadAsset: React.FC<Props> = ({
  alertList,
  alsoLink,
  displayUploadModal,
  fileList,
  hasCreateRight,
  onUpload,
  onUploadModalCancel,
  onUploadModalClose,
  setUploadType,
  setUploadUrl,
  uploading,
  uploadModalVisibility,
  uploadProps,
  uploadType,
  uploadUrl,
}) => {
  const t = useT();
  return (
    <>
      <Button
        disabled={!hasCreateRight}
        icon={<Icon icon="upload" />}
        onClick={displayUploadModal}
        type="primary">
        {t("Upload Asset")}
      </Button>
      <UploadModal
        alertList={alertList}
        alsoLink={alsoLink}
        fileList={fileList}
        onCancel={onUploadModalCancel}
        onUpload={onUpload}
        onUploadModalClose={onUploadModalClose}
        setUploadType={setUploadType}
        setUploadUrl={setUploadUrl}
        uploading={uploading}
        uploadProps={uploadProps}
        uploadType={uploadType}
        uploadUrl={uploadUrl}
        visible={uploadModalVisibility}
      />
    </>
  );
};

export default UploadAsset;
