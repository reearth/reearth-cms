import { useMemo, useRef, useCallback } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import GeometryItem from "@reearth-cms/components/molecules/Common/Form/GeometryItem";
import MultiValueGeometry from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGeometry";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";
import { requiredValidator } from "../utils";

const GeometryField: React.FC<FieldProps> = ({
  field,
  itemGroupId,
  disabled,
  itemHeights,
  onItemHeightChange,
}) => {
  const t = useT();
  const errorSet = useRef(new Set<number>());

  const errorAdd = useCallback((index: number) => {
    errorSet.current.add(index);
  }, []);

  const errorDelete = useCallback((index: number) => {
    errorSet.current.delete(index);
  }, []);

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
          validator: requiredValidator,
          message: t("Please input field!"),
        },
        {
          validator: async () => {
            return errorSet.current.size ? Promise.reject() : Promise.resolve();
          },
        },
      ]}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      {field.multiple ? (
        <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
          <MultiValueGeometry
            supportedTypes={supportedTypes}
            isEditor={isEditor}
            disabled={disabled}
            errorAdd={errorAdd}
            errorDelete={errorDelete}
          />
        </ResponsiveHeight>
      ) : (
        <GeometryItem
          supportedTypes={supportedTypes}
          isEditor={isEditor}
          disabled={disabled}
          errorAdd={() => errorAdd(0)}
          errorDelete={() => errorDelete(0)}
        />
      )}
    </Form.Item>
  );
};

export default GeometryField;
