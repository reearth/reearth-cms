export const getExtension = (filename: string) => {
  if (!filename.includes(".")) return "";

  return filename.slice(filename.lastIndexOf(".") + 1, filename.length);
};
