import { Upload } from "antd";
import {
  UploadChangeParam,
  UploadFile as ANTDFileUpload,
  UploadProps,
} from "antd/lib/upload/interface";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UploadFile<T = any> = {
  skipDecompression?: boolean;
} & ANTDFileUpload<T>;

export default Upload;
export type { UploadChangeParam, UploadFile, UploadProps };
