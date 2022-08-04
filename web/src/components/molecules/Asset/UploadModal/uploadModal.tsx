import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import Upload, { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";

const { TabPane } = Tabs;

type Props = {
  visible: boolean;
  uploadProps: UploadProps;
  fileList: UploadFile<any>[];
  uploading: boolean;
  handleUpload: () => void;
  handleCancel: () => void;
};

const { Dragger } = Upload;

const UploadModal: React.FC<Props> = ({
  visible,
  uploadProps,
  uploading,
  fileList,
  handleUpload,
  handleCancel,
}) => {
  const handleTabChange = (key: string) => {
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
          <div>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <Icon icon="inbox" />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibit from uploading company data
                or other band files
              </p>
            </Dragger>
          </div>
        </TabPane>
        <TabPane tab="URL" key="2"></TabPane>
        <TabPane tab="Google Drive" key="3"></TabPane>
      </Tabs>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          padding: "10px",
        }}>
        <Button type="default" onClick={handleCancel} style={{ marginRight: "8px" }}>
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList && fileList?.length === 0}
          loading={uploading}>
          {uploading ? "Uploading" : "Upload"}
        </Button>
      </div>
    </Modal>
  );
};

export default UploadModal;
