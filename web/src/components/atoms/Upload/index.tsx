import { Upload } from "antd";
import {
  UploadChangeParam,
  UploadFile as ANTDFileUpload,
  UploadProps,
  RcFile,
} from "antd/lib/upload/interface";

interface UploadFile<T = any> extends ANTDFileUpload<T> {
  skipDecompression?: boolean;
}

export default Upload;
export type { UploadChangeParam, UploadFile, UploadProps, RcFile };
