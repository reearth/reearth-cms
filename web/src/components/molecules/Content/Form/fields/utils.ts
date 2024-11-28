import { RuleObject } from "@reearth-cms/components/atoms/Form";

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
