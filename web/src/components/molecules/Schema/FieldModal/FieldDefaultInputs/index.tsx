import React from "react";

import { FieldType } from "../../types";

import AssetField from "./AssetField";
import IntegerField from "./IntegerField";
import SelectField from "./SelectField";
import TextAreaField from "./TextArea";
import TextField from "./TextField";

export interface Props {
  selectedType: FieldType;
  selectedValues: string[];
}

const FieldDefaultInputs: React.FC<Props> = ({ selectedType, selectedValues }) => {
  return selectedType ? (
    selectedType === "TextArea" || selectedType === "MarkdownText" ? (
      <TextAreaField />
    ) : selectedType === "Integer" ? (
      <IntegerField />
    ) : selectedType === "Asset" ? (
      <AssetField />
    ) : selectedType === "Select" ? (
      <SelectField selectedValues={selectedValues} />
    ) : (
      <TextField />
    )
  ) : null;
};

export default FieldDefaultInputs;
