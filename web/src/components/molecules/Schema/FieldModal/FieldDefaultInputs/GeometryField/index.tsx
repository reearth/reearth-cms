import Form from "@reearth-cms/components/atoms/Form";
import GeometryItem from "@reearth-cms/components/molecules/Common/Form/GeometryItem";
import MultiValueGeometry from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGeometry";
import {
  ObjectSupportedType,
  EditorSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";
import React from "react";

type Props = {
  supportedTypes?: ObjectSupportedType[] | EditorSupportedType;
  isEditor: boolean;
  multiple: boolean;
  workspaceSettings: WorkspaceSettings;
  settingsLoading: boolean;
};

const GeometryField: React.FC<Props> = ({
  supportedTypes,
  isEditor,
  multiple,
  workspaceSettings,
  settingsLoading,
}) => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      {multiple ? (
        <MultiValueGeometry
          supportedTypes={supportedTypes}
          isEditor={isEditor}
          workspaceSettings={workspaceSettings}
          settingsLoading={settingsLoading}
        />
      ) : (
        <GeometryItem
          supportedTypes={supportedTypes}
          isEditor={isEditor}
          workspaceSettings={workspaceSettings}
          settingsLoading={settingsLoading}
        />
      )}
    </Form.Item>
  );
};

export default GeometryField;
