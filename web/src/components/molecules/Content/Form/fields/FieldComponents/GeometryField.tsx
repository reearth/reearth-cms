import { useMemo } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import GeometryItem from "@reearth-cms/components/molecules/Common/Form/GeometryItem";
import MultiValueGeometry from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGeometry";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";

interface DefaultFieldProps {
  field: Field;
  itemGroupId?: string;
  disabled?: boolean;
}

const GeometryField: React.FC<DefaultFieldProps> = ({ field, itemGroupId, disabled }) => {
  const t = useT();

  const supportedTypes = useMemo(
    () => field.typeProperty?.objectSupportedTypes ?? field.typeProperty?.editorSupportedTypes?.[0],
    [field.typeProperty?.editorSupportedTypes, field.typeProperty?.objectSupportedTypes],
  );

  const isEditor = useMemo(() => field.type === "GeometryEditor", [field.type]);

  return (
    <Form.Item
      extra={field.description}
      rules={[
        {
          required: field.required,
          message: t("Please input field!"),
        },
      ]}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      {field.multiple ? (
        <MultiValueGeometry
          supportedTypes={supportedTypes}
          isEditor={isEditor}
          disabled={disabled}
        />
      ) : (
        <GeometryItem supportedTypes={supportedTypes} isEditor={isEditor} disabled={disabled} />
      )}
    </Form.Item>
  );
};

export default GeometryField;
