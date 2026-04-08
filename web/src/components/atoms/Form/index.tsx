import { Form, FormInstance, FormProps, FormRule } from "antd";
import type { FormItemProps } from "antd";
import type { FormItemLabelProps } from "antd/es/form/FormItemLabel";

type Rule = FormRule;
type RuleObject = Exclude<FormRule, (...args: never[]) => unknown>;

type FieldError = {
  name: (string | number)[];
  errors: string[];
};

type ValidateErrorEntity = {
  values: Record<string, unknown>;
  errorFields: FieldError[];
  outOfDate: boolean;
};

export default Form;

export type {
  FormItemProps,
  FormItemLabelProps,
  FieldError,
  FormInstance,
  FormProps,
  FormRule,
  Rule,
  RuleObject,
  ValidateErrorEntity,
};
