import { Upload } from "antd";
import type { UploadFile as AntdUploadFile, UploadProps } from "antd";

type UploadChangeParam<T = AntdUploadFile> = {
  file: T;
  fileList: T[];
  event?: { percent: number };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UploadFile<T = any> = {
  skipDecompression?: boolean;
} & AntdUploadFile<T>;

export default Upload;
export type { UploadChangeParam, UploadFile, UploadProps };
export type { RcFile } from "antd/es/upload";
