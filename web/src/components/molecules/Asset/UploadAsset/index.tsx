import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Upload, { UploadProps } from "@reearth-cms/components/atoms/Upload";

const UploadAsset: React.FC<UploadProps> = ({ ...props }) => {
  return (
    <Upload {...props}>
      <Button type="primary" icon={<Icon icon="upload" />}>
        Upload Asset
      </Button>
    </Upload>
  );
};

export default UploadAsset;
