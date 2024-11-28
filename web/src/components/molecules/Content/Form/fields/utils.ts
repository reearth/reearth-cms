import { Rule } from "@reearth-cms/components/atoms/Form";

export const checkIfEmpty = (value: unknown) =>
  value === undefined || value === null || value === "";

export const requiredValidator = (_: Rule, value: unknown) => {
  if (checkIfEmpty(value) || (Array.isArray(value) && value.every(v => checkIfEmpty(v)))) {
    return Promise.reject();
  }
  return Promise.resolve();
};
