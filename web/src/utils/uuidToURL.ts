export const uuidToURL = (uuid: string, objectName: string) => {
  // TODO: needs proper implementation
  if (!uuid || !objectName) return "";
  const storageHost = window.REEARTH_CONFIG?.storageHost ?? "http://localhost:8080";
  const assetBase = window.REEARTH_CONFIG?.assetBase ?? "assets";
  const path = getPathFromUUID(uuid, objectName);
  if (!path) return "";
  return joinPath(storageHost, assetBase, path);
};

export const getPathFromUUID = (uuid: string, objectName: string) => {
  if (!uuid || !objectName) return "";

  return joinPath(uuid.slice(0, 2), uuid.slice(2), objectName);
};

export const joinPath = (...args: string[]) => {
  // TODO: we need a better way for joining a path
  return args.map(arg => (arg.endsWith("/") ? arg.slice(0, -1) : arg)).join("/");
};
