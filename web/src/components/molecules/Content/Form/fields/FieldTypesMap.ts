import {
  BoolField,
  CheckboxField,
  DateField,
  DefaultField,
  TagField,
  URLField,
} from "./FieldComponents";
import GeometryField from "./FieldComponents/GeometryField";
import MarkdownField from "./FieldComponents/MarkdownField";
import NumberField from "./FieldComponents/NumberField";
import SelectField from "./FieldComponents/SelectField";
import TextareaField from "./FieldComponents/TextareaField";

export const FIELD_TYPE_COMPONENT_MAP = {
  Bool: BoolField,
  Checkbox: CheckboxField,
  Date: DateField,
  GeometryEditor: GeometryField,
  GeometryObject: GeometryField,
  Integer: NumberField,
  MarkdownText: MarkdownField,
  Number: NumberField,
  Select: SelectField,
  Tag: TagField,
  Text: DefaultField,
  TextArea: TextareaField,
  URL: URLField,
};
