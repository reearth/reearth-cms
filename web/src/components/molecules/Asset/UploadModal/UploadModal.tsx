import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { useT } from "@reearth-cms/i18n";

import LocalTab from "./localTab";

const { TabPane } = Tabs;

type Props = {
  alsoLink?: boolean;
  visible: boolean;
  uploadProps: UploadProps;
  fileList: UploadFile<File>[];
  uploading: boolean;
  afterClose?: () => void;
  handleUpload: () => void;
  handleCancel: () => void;
};

const UploadModal: React.FC<Props> = ({
  alsoLink,
  visible,
  uploadProps,
  uploading,
  fileList,
  afterClose,
  handleUpload,
  handleCancel,
}) => {
  const t = useT();
  const handleTabChange = (key: string) => {
    // needs implementation
    console.log(key);
  };

  return (
    <Modal
      centered
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width="50vw"
      afterClose={afterClose}
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        paddingBottom: "80px",
      }}>
      <div>
        <h2>{t("Asset Uploader")}</h2>
      </div>
      <Tabs defaultActiveKey="1" onChange={handleTabChange}>
        <TabPane tab={t("Local")} key="1">
          <LocalTab uploadProps={uploadProps} />
        </TabPane>
        {/* TODO: uncomment this once upload asset by url is implemented */}
        {/* <TabPane tab={t("URL")} key="2" /> */}
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
          disabled={fileList && fileList?.length === 0}
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
