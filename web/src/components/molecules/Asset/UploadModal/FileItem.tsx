import { Button } from "antd";
import { useMemo } from "react";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { useT } from "@reearth-cms/i18n";

import { isImageUrl, checkIfCompressedFile } from "./util";

type Props = {
  file: UploadFile<unknown>;
  remove: () => void;
};

const FileItem: React.FC<Props> = ({ file, remove }) => {
  const t = useT();
  const isCompressedFile = useMemo(() => checkIfCompressedFile(file.name), [file.name]);

  return (
    <div className="ant-upload-list-item">
      <div className="ant-upload-list-item-thumbnail ant-upload-list-item-file">
        <Icon icon={isImageUrl(file) ? "pictureTwoTone" : "fileTwoTone"} />
      </div>
      <span className="ant-upload-list-item-name">{file.name}</span>
      {isCompressedFile && (
        <Checkbox
          defaultChecked
          onChange={() => {
            file.skipDecompression = !file.skipDecompression;
          }}>
          {t("Auto Unzip")}
        </Checkbox>
      )}
      <Button type="text" title={t("Remove file")} icon={<Icon icon="delete" />} onClick={remove} />
    </div>
  );
};

export default FileItem;
