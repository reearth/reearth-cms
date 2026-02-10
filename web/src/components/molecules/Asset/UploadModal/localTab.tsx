import { ReactElement } from "react";

import Alert, { type AlertProps } from "@reearth-cms/components/atoms/Alert";
import Icon from "@reearth-cms/components/atoms/Icon";
import Upload, { UploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import FileItem from "@reearth-cms/components/molecules/Asset/UploadModal/FileItem";
import { useT } from "@reearth-cms/i18n";

const { Dragger } = Upload;

type Props = {
  uploadProps: UploadProps;
  alertList?: AlertProps[];
};

const LocalTab: React.FC<Props> = ({ uploadProps, alertList = [] }) => {
  const t = useT();
  return (
    <div>
      <Dragger
        itemRender={(
          _originNode: ReactElement,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          file: UploadFile<any>,
          _fileList,
          { remove },
        ) => <FileItem file={file} remove={remove} />}
        {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <Icon icon="inbox" />
        </p>
        <p className="ant-upload-text">{t("Click or drag files to this area to upload")}</p>
        <p className="ant-upload-hint">
          {uploadProps.multiple
            ? t("Single or multiple file upload is supported")
            : t("Only single file upload is supported")}
        </p>
        {alertList.map((alert, index) => (
          <Alert
            {...alert}
            key={alert?.message?.toString() || index}
            onClick={e => e.stopPropagation()}
          />
        ))}
      </Dragger>
    </div>
  );
};

export default LocalTab;
