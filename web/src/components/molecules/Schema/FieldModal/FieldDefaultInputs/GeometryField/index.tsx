import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import GeometryItem from "@reearth-cms/components/molecules/Common/Form/GeometryItem";
import MultiValueGeometry from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGeometry";
import {
  ObjectSupportedType,
  EditorSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

interface Props {
  supportedTypes?: ObjectSupportedType[] | EditorSupportedType;
  isEditor: boolean;
  multiple: boolean;
  workspaceSettings: WorkspaceSettings;
}

const GeometryField: React.FC<Props> = ({
  supportedTypes,
  isEditor,
  multiple,
  workspaceSettings,
}) => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      {multiple ? (
        <MultiValueGeometry
          supportedTypes={supportedTypes}
          isEditor={isEditor}
          workspaceSettings={workspaceSettings}
        />
      ) : (
        <GeometryItem
          supportedTypes={supportedTypes}
          isEditor={isEditor}
          workspaceSettings={workspaceSettings}
        />
      )}
    </Form.Item>
  );
};

export default GeometryField;
