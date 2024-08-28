import Form from "@reearth-cms/components/atoms/Form";
import GeometryItem from "@reearth-cms/components/molecules/Common/Form/GeometryItem";
import MultiValueGeometry from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGeometry";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";
import { useMemo, useState, useCallback } from "react";

import FieldTitle from "../../FieldTitle";

type DefaultFieldProps = {
  field: Field;
  workspaceSettings: WorkspaceSettings;
  settingsLoading: boolean;
  itemGroupId?: string;
  disabled?: boolean;
};

const GeometryField: React.FC<DefaultFieldProps> = ({
  field,
  workspaceSettings,
  settingsLoading,
  itemGroupId,
  disabled,
}) => {
  const t = useT();
  const [errorSet, setErrorSet] = useState(new Set<number>());

  const errorAdd = useCallback((index: number) => {
    setErrorSet?.(prev => {
      prev.add(index);
      return new Set(prev);
    });
  }, []);

  const errorDelete = useCallback((index: number) => {
    setErrorSet?.(prev => {
      prev.delete(index);
      return new Set(prev);
    });
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
          message: t("Please input field!"),
        },
        {
          validator: async () => {
            return errorSet.size ? Promise.reject() : Promise.resolve();
          },
        },
      ]}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      {field.multiple ? (
        <MultiValueGeometry
          supportedTypes={supportedTypes}
          isEditor={isEditor}
          disabled={disabled}
          errorAdd={errorAdd}
          errorDelete={errorDelete}
          workspaceSettings={workspaceSettings}
          settingsLoading={settingsLoading}
        />
      ) : (
        <GeometryItem
          supportedTypes={supportedTypes}
          isEditor={isEditor}
          disabled={disabled}
          errorAdd={() => errorAdd(0)}
          errorDelete={() => errorDelete(0)}
          workspaceSettings={workspaceSettings}
          settingsLoading={settingsLoading}
        />
      )}
    </Form.Item>
  );
};

export default GeometryField;
