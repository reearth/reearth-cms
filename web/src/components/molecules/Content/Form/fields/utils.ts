import { RuleObject } from "@reearth-cms/components/atoms/Form";
import { validateURL } from "@reearth-cms/utils/regex";

export const checkIfEmpty = (value: unknown) =>
  value === undefined || value === null || value === "";

export const requiredValidator = (rule: RuleObject, value: unknown) => {
  if (
    rule.required &&
    (checkIfEmpty(value) || (Array.isArray(value) && value.every(v => checkIfEmpty(v))))
  ) {
    return Promise.reject();
  }
  return Promise.resolve();
};

export const urlErrorIndexesGet = (value: string | string[]) => {
  const indexes: number[] = [];
  if (Array.isArray(value)) {
    value.forEach((v: string, index: number) => {
      if (v && !validateURL(v)) indexes.push(index);
    });
  } else if (value && !validateURL(value)) {
    indexes.push(0);
  }
  return indexes;
};
