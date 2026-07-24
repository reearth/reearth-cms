import type { FormInstance } from "antd";
import { Form } from "antd";
import type { Rule, RuleObject } from "antd/es/form";
import type { FormItemProps } from "antd/es/form/FormItem";
import type { FormItemLabelProps } from "antd/es/form/FormItemLabel";
import type { FieldError, ValidateErrorEntity } from "rc-field-form/lib/interface";

export default Form;

export type {
  FormItemProps,
  FormItemLabelProps,
  FieldError,
  FormInstance,
  Rule,
  RuleObject,
  ValidateErrorEntity,
};
