import { Upload } from "antd";
import {
  UploadChangeParam,
  UploadFile as ANTDFileUpload,
  UploadProps,
} from "antd/lib/upload/interface";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface UploadFile<T = any> extends ANTDFileUpload<T> {
  skipDecompression?: boolean;
}

export default Upload;
export type { UploadChangeParam, UploadFile, UploadProps };
