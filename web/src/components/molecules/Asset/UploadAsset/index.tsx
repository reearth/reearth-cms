import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Upload from "@reearth-cms/components/atoms/Upload";
import { UploadProps } from "antd/lib/upload/interface";

const UploadAsset: React.FC<UploadProps> = ({ ...props }) => {
  return (
    <Upload {...props}>
      <Button type="primary" icon={<Icon.upload />}>
        Upload Asset
      </Button>
    </Upload>
  );
};

export default UploadAsset;
