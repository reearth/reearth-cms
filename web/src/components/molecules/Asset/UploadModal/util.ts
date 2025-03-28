import { UploadFile } from "@reearth-cms/components/atoms/Upload";

const extGet = (url = "") => {
  const temp = url.split("/");
  const filename = temp[temp.length - 1];
  const filenameWithoutSuffix = filename.split(/#|\?/)[0];
  return (/\.[^./\\]*$/.exec(filenameWithoutSuffix) || [""])[0];
};

export const isImageUrl = (file: UploadFile) => {
  const url = file.thumbUrl || file.url || "";
  return (
    (!file.thumbUrl && file.type && /^image\//.test(file.type)) ||
    /^data:image\//.test(url) ||
    /(webp|svg|png|gif|jpg|jpeg|jfif|bmp|dpg|ico|heic|heif)$/i.test(extGet(url))
  );
};

export const checkIfCompressedFile = (fileName: string) => /\.zip|\.7z$/.test(fileName);
