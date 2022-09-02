export const uuidToURL = (uuid: string, filename: string) => {
  // TODO: needs proper implementation
  const host = "http://127.0.0.1:8080";
  const path = getPathFromUUID(uuid, filename);
  return join(host, path);
};

export const getPathFromUUID = (uuid: string, filename: string) => {
  if (!uuid || !filename) {
    return "";
  }

  const assetDir = "assets";
  const path = join(assetDir, uuid.slice(0, 2), uuid.slice(2), filename);
  return path;
};

const join = (...args: string[]) => {
  return args.join("/");
};
