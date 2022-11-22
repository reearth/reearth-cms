import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { useT } from "@reearth-cms/i18n";

import LocalTab from "./localTab";
import UrlTab from "./UrlTab";

const { TabPane } = Tabs;

type Props = {
  alsoLink?: boolean;
  visible: boolean;
  uploadProps: UploadProps;
  fileList: UploadFile<File>[];
  uploading: boolean;
  uploadUrl: string;
  uploadType: UploadType;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onUploadModalClose?: () => void;
  handleUpload: () => void;
  handleCancel: () => void;
};

const UploadModal: React.FC<Props> = ({
  alsoLink,
  visible,
  uploadProps,
  uploading,
  fileList,
  uploadUrl,
  uploadType,
  setUploadUrl,
  setUploadType,
  onUploadModalClose,
  handleUpload,
  handleCancel,
}) => {
  const t = useT();
  const handleTabChange = (key: string) => {
    setUploadType(key as UploadType);
  };

  return (
    <Modal
      centered
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width="50vw"
      afterClose={onUploadModalClose}
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        paddingBottom: "80px",
      }}>
      <div>
        <h2>{t("Asset Uploader")}</h2>
      </div>
      <Tabs activeKey={uploadType} onChange={handleTabChange}>
        <TabPane tab={t("Local")} key="local">
          <LocalTab uploadProps={uploadProps} />
        </TabPane>
        <TabPane tab={t("URL")} key="url">
          <UrlTab uploadUrl={uploadUrl} setUploadUrl={setUploadUrl} />
        </TabPane>
        {/* TODO: uncomment this once upload asset from google drive is implemented */}
        {/* <TabPane tab={t("Google Drive")} key="3" /> */}
      </Tabs>
      <Footer>
        <CancelButton type="default" disabled={uploading} onClick={handleCancel}>
          {t("Cancel")}
        </CancelButton>
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList?.length === 0 && !uploadUrl}
          loading={uploading}>
          {uploading ? t("Uploading") : alsoLink ? t("Upload and Link") : t("Upload")}
        </Button>
      </Footer>
    </Modal>
  );
};

const Footer = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 10px;
`;

const CancelButton = styled(Button)`
  margin-right: 8px;
`;

export default UploadModal;
