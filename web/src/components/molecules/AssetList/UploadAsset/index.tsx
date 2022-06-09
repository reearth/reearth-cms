import { UploadOutlined } from "@ant-design/icons";
import Button from "@reearth-cms/components/atoms/Button";
import Upload from "@reearth-cms/components/atoms/Upload";
import { UploadChangeParam, UploadFile } from "antd/lib/upload/interface";

type UploadAssetProps = {
  handleUpload: (info: UploadChangeParam<UploadFile<any>>) => void;
};

const UploadAsset: React.FC<UploadAssetProps> = ({ handleUpload }) => {
  return (
    <Upload
      multiple={false}
      directory={false}
      onChange={handleUpload}
      showUploadList={false}
      accept="image/*,.zip"
    >
      <Button type="primary" icon={<UploadOutlined />}>
        Upload Asset
      </Button>
    </Upload>
  );
};

export default UploadAsset;
