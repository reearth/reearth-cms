import { Upload } from "antd";
import {
  UploadChangeParam,
  UploadFile as ANTDFileUpload,
  UploadProps,
} from "antd/lib/upload/interface";

interface UploadFile<T = any> extends ANTDFileUpload<T> {
  autoUnzip?: boolean;
}

export default Upload;
export type { UploadChangeParam, UploadFile, UploadProps };
