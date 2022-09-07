const keyRegex = /^[a-zA-Z0-9_-]{5,32}$/;

export const validateKey = (key: string): boolean => {
  return keyRegex.test(key);
};
