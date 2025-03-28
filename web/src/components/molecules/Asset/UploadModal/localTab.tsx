import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Upload, { UploadFile } from "@reearth-cms/components/atoms/Upload";
import FileItem from "@reearth-cms/components/molecules/Asset/UploadModal/FileItem";
import { useT } from "@reearth-cms/i18n";

const { Dragger } = Upload;

type Props = {
  isWithLink: boolean;
};

const LocalTab: React.FC<Props> = ({ isWithLink }) => {
  const t = useT();
  return (
    <Form.Item name="file">
      <Dragger
        itemRender={(_originNode, file: UploadFile<unknown>, _fileList, { remove }) => (
          <FileItem file={file} remove={remove} />
        )}
        multiple={isWithLink ? false : true}
        maxCount={isWithLink ? 1 : undefined}
        directory={false}
        showUploadList
        accept={"*"}
        listType={"picture"}>
        <p className="ant-upload-drag-icon">
          <Icon icon="inbox" />
        </p>
        <p className="ant-upload-text">{t("Click or drag files to this area to upload")}</p>
        <p className="ant-upload-hint">{t("Single or multiple file upload is supported")}</p>
      </Dragger>
    </Form.Item>
  );
};

export default LocalTab;
