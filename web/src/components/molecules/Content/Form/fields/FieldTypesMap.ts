import {
  DefaultField,
  TagField,
  DateField,
  BoolField,
  CheckboxField,
  URLField,
} from "./FieldComponents";
import GeometryField from "./FieldComponents/GeometryField";
import MarkdownField from "./FieldComponents/MarkdownField";
import NumberField from "./FieldComponents/NumberField";
import SelectField from "./FieldComponents/SelectField";
import TextareaField from "./FieldComponents/TextareaField";

export const FIELD_TYPE_COMPONENT_MAP = {
  Text: DefaultField,
  Tag: TagField,
  Date: DateField,
  Bool: BoolField,
  Checkbox: CheckboxField,
  URL: URLField,
  TextArea: TextareaField,
  MarkdownText: MarkdownField,
  Integer: NumberField,
  Number: NumberField,
  Select: SelectField,
  GeometryObject: GeometryField,
  GeometryEditor: GeometryField,
};
