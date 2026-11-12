import React, { useCallback, useRef } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import GeometryEditorV2 from "@reearth-cms/components/molecules/Common/Form/GeometryEditorV2";
import GeometryItem from "@reearth-cms/components/molecules/Common/Form/GeometryItem";
import MultiValueGeometry from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGeometry";
import type {
  ObjectSupportedType,
  EditorSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  supportedTypes?: ObjectSupportedType[] | EditorSupportedType;
  isEditor: boolean;
  multiple: boolean;
  /** The unified Geometry field: default value set with the new editor. */
  unified?: boolean;
};

const GeometryField: React.FC<Props> = ({ supportedTypes, isEditor, multiple, unified }) => {
  const t = useT();
  const errorSet = useRef(new Set<number>());

  const errorAdd = useCallback((index: number) => {
    errorSet.current.add(index);
  }, []);

  const errorDelete = useCallback((index: number) => {
    errorSet.current.delete(index);
  }, []);

  return (
    <Form.Item
      name="defaultValue"
      label={t("Set default value")}
      rules={[
        {
          validator: () => {
            return errorSet.current.size ? Promise.reject() : Promise.resolve();
          },
        },
      ]}>
      {unified ? (
        <GeometryEditorV2
          title={t("Set default value")}
          multiple={multiple}
          onValidityChange={valid => (valid ? errorDelete(0) : errorAdd(0))}
        />
      ) : multiple ? (
        <MultiValueGeometry
          supportedTypes={supportedTypes}
          isEditor={isEditor}
          errorAdd={errorAdd}
          errorDelete={errorDelete}
        />
      ) : (
        <GeometryItem
          supportedTypes={supportedTypes}
          isEditor={isEditor}
          errorAdd={() => errorAdd(0)}
          errorDelete={() => errorDelete(0)}
        />
      )}
    </Form.Item>
  );
};

export default GeometryField;
