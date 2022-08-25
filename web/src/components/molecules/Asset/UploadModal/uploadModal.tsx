import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";

import Tab1 from "./tab1";

const { TabPane } = Tabs;

type Props = {
  visible: boolean;
  uploadProps: UploadProps;
  fileList: UploadFile<any>[];
  uploading: boolean;
  handleUpload: () => void;
  handleCancel: () => void;
};

const UploadModal: React.FC<Props> = ({
  visible,
  uploadProps,
  uploading,
  fileList,
  handleUpload,
  handleCancel,
}) => {
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
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        paddingBottom: "80px",
      }}>
      <div>
        <h2>Asset Uploader</h2>
      </div>
      <Tabs defaultActiveKey="1" onChange={handleTabChange}>
        <TabPane tab="Local" key="1">
          <Tab1 uploadProps={uploadProps} />
        </TabPane>
        <TabPane tab="URL" key="2"></TabPane>
        <TabPane tab="Google Drive" key="3"></TabPane>
      </Tabs>
      <Footer>
        <CancelButton type="default" onClick={handleCancel}>
          Cancel
        </CancelButton>
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList && fileList?.length === 0}
          loading={uploading}>
          {uploading ? "Uploading" : "Upload"}
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
