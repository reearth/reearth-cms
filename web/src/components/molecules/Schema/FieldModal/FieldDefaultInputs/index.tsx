import {
  ObjectSupportedType,
  EditorSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";

import { FieldType } from "../../types";

import AssetField, { DefaultAssetProps } from "./AssetField";
import BooleanField from "./BooleanField";
import CheckboxField from "./CheckboxField";
import DateField from "./DateField";
import GeometryField from "./GeometryField";
import GroupField from "./GroupField";
import MarkdownField from "./Markdown";
import NumberField from "./NumberField";
import SelectField from "./SelectField";
import TagField from "./TagField";
import TextAreaField from "./TextArea";
import TextField from "./TextField";
import URLField from "./URLField";

type Props = {
  selectedType: FieldType;
  selectedValues?: string[];
  selectedTags?: { id: string; name: string; color: string }[];
  selectedSupportedTypes?: ObjectSupportedType[] | EditorSupportedType;
  maxLength?: number;
  min?: number;
  max?: number;
  multiple: boolean;
  assetProps: DefaultAssetProps;
};

const FieldDefaultInputs: React.FC<Props> = ({
  selectedType,
  selectedValues,
  selectedTags,
  selectedSupportedTypes,
  maxLength,
  min,
  max,
  multiple,
  assetProps,
}) => {
  switch (selectedType) {
    case "TextArea":
      return <TextAreaField multiple={multiple} maxLength={maxLength} />;
    case "MarkdownText":
      return <MarkdownField multiple={multiple} maxLength={maxLength} />;
    case "Integer":
    case "Number":
      return <NumberField multiple={multiple} min={min} max={max} />;
    case "Bool":
      return <BooleanField multiple={multiple} />;
    case "Date":
      return <DateField multiple={multiple} />;
    case "Tag":
      return <TagField selectedTags={selectedTags} multiple={multiple} />;
    case "Checkbox":
      return <CheckboxField multiple={multiple} />;
    case "Asset":
      return <AssetField multiple={multiple} {...assetProps} />;
    case "Select":
      return <SelectField selectedValues={selectedValues} multiple={multiple} />;
    case "URL":
      return <URLField multiple={multiple} />;
    case "Group":
      return <GroupField />;
    case "GeometryObject":
    case "GeometryEditor":
      return (
        <GeometryField
          supportedTypes={selectedSupportedTypes}
          isEditor={selectedType === "GeometryEditor"}
          multiple={multiple}
        />
      );
    case "Text":
    default:
      return <TextField multiple={multiple} maxLength={maxLength} />;
  }
};

export default FieldDefaultInputs;
