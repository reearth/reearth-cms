import React, { useCallback, useRef } from "react";

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
      {multiple ? (
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
