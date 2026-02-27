import React, { useCallback, useRef } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import GeometryItem from "@reearth-cms/components/molecules/Common/Form/GeometryItem";
import MultiValueGeometry from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGeometry";
import {
  EditorSupportedType,
  ObjectSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  isEditor: boolean;
  multiple: boolean;
  supportedTypes?: EditorSupportedType | ObjectSupportedType[];
};

const GeometryField: React.FC<Props> = ({ isEditor, multiple, supportedTypes }) => {
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
      label={t("Set default value")}
      name="defaultValue"
      rules={[
        {
          validator: () => {
            return errorSet.current.size ? Promise.reject() : Promise.resolve();
          },
        },
      ]}>
      {multiple ? (
        <MultiValueGeometry
          errorAdd={errorAdd}
          errorDelete={errorDelete}
          isEditor={isEditor}
          supportedTypes={supportedTypes}
        />
      ) : (
        <GeometryItem
          errorAdd={() => errorAdd(0)}
          errorDelete={() => errorDelete(0)}
          isEditor={isEditor}
          supportedTypes={supportedTypes}
        />
      )}
    </Form.Item>
  );
};

export default GeometryField;
