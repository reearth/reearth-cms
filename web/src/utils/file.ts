export const getExtension = (filename: string) => {
  if (!filename.includes(".")) return "";

  return filename.split(".").pop();
};
