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

  const name = isGCSEnabled() ? toGCNaming(objectName) : objectName;
  return joinPath(uuid.slice(0, 2), uuid.slice(2), name);
};

export const joinPath = (...args: string[]) => {
  // TODO: we need a better way for joining a path
  return args.map(arg => (arg.endsWith("/") ? arg.slice(0, -1) : arg)).join("/");
};

export const toGCNaming = (objectName: string) => {
  // TODO: we need a better way for google cloud naming
  return objectName.toLowerCase().replace(/[^a-zA-Z0-9-.:/]/g, "-");
};

const isGCSEnabled = () => {
  // TODO: we need to find a way to check wether the google cloud storage is used or not
  return true;
};
