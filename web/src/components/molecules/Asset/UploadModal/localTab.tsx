import Icon from "@reearth-cms/components/atoms/Icon";
import Upload, { UploadProps } from "@reearth-cms/components/atoms/Upload";

const { Dragger } = Upload;

type Props = {
  uploadProps: UploadProps;
};

const LocalTab: React.FC<Props> = ({ uploadProps }) => {
  return (
    <div>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <Icon icon="inbox" />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibit from uploading company data or
          other band files
        </p>
      </Dragger>
    </div>
  );
};

export default LocalTab;
