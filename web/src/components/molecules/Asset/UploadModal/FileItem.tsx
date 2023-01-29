import { Button } from "antd";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { useT } from "@reearth-cms/i18n";

import { isImageUrl } from "./util";

type Props = {
  file: UploadFile<any>;
  remove: () => void;
};

const FileItem: React.FC<Props> = ({ file, remove }) => {
  const t = useT();
  return (
    <div className="ant-upload-list-item">
      <span className="ant-upload-span">
        <div className="ant-upload-list-item-thumbnail ant-upload-list-item-file">
          <Icon icon={isImageUrl(file) ? "pictureTwoTone" : "fileTwoTone"} />
        </div>
        <span className="ant-upload-list-item-name" title={file.name}>
          {file.name}
        </span>

        <Checkbox
          value={file?.autoUnzip}
          onChange={() => {
            if (!file?.autoUnzip) file.autoUnzip = true;
            else file.autoUnzip = !file.autoUnzip;
          }}>
          {t("Auto Unzip")}
        </Checkbox>
        <Button
          type="text"
          title={t("Remove file")}
          icon={<Icon icon="delete" />}
          onClick={remove}
        />
      </span>
    </div>
  );
};

export default FileItem;
