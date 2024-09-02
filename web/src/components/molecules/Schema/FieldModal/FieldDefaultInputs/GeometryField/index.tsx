import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import GeometryItem from "@reearth-cms/components/molecules/Common/Form/GeometryItem";
import MultiValueGeometry from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGeometry";
import {
  ObjectSupportedType,
  EditorSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  supportedTypes?: ObjectSupportedType[] | EditorSupportedType;
  isEditor: boolean;
  multiple: boolean;
};

const GeometryField: React.FC<Props> = ({ supportedTypes, isEditor, multiple }) => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      {multiple ? (
        <MultiValueGeometry supportedTypes={supportedTypes} isEditor={isEditor} />
      ) : (
        <GeometryItem supportedTypes={supportedTypes} isEditor={isEditor} />
      )}
    </Form.Item>
  );
};

export default GeometryField;
