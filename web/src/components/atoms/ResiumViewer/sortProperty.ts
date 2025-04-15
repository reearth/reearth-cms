// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortProperties = <T extends Record<string, any>>(properties: T) => {
  if (!properties) return;
  const sortedKeys = Object.keys(properties).sort((k1, k2) => k1.localeCompare(k2));
  const sortedProperties = sortedKeys.reduce(
    (obj, k) => {
      let val = properties[k];
      if (val !== null && typeof val === "object" && !Array.isArray(val)) {
        val = sortProperties(val);
      }
      obj[k] = val;
      return obj;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as Record<string, any>,
  );
  return sortedProperties;
};
