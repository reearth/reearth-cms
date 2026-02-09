import { Form, FormInstance, FormProps, FormRule } from "antd";
import type { FormItemProps } from "antd";
import type { FormItemLabelProps } from "antd/es/form/FormItemLabel";
import { FieldError, ValidateErrorEntity } from "rc-field-form/lib/interface";

type Rule = FormRule;
type RuleObject = Exclude<FormRule, (...args: never[]) => unknown>;

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
