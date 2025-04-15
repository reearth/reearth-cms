import { Form, FormInstance } from "antd";
import { Rule, RuleObject } from "antd/lib/form";
import { FormItemProps } from "antd/lib/form/FormItem";
import { FormItemLabelProps } from "antd/lib/form/FormItemLabel";
import { FieldError, ValidateErrorEntity } from "rc-field-form/lib/interface";

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
