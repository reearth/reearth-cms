import styled from "@emotion/styled";
import { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import GeometryItem from "@reearth-cms/components/molecules/Common/Form/GeometryItem";
import {
  ObjectSupportedType,
  EditorSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

import { moveItemInArray } from "../moveItemArray";

type Props = {
  value?: string[];
  onChange?: (value: string[]) => void;
  supportedTypes?: ObjectSupportedType[] | EditorSupportedType;
  isEditor: boolean;
  disabled?: boolean;
  errorAdd?: (index: number) => void;
  errorDelete?: (index: number) => void;
  workspaceSettings: WorkspaceSettings;
  settingsLoading: boolean;
};

const MultiValueGeometry: React.FC<Props> = ({
  value = [],
  onChange,
  supportedTypes,
  isEditor,
  disabled,
  errorAdd,
  errorDelete,
  workspaceSettings,
  settingsLoading,
}) => {
  const t = useT();
  const handleInput = useCallback(
    (e: string, id: number) => {
      onChange?.(value?.map((valueItem, index) => (index === id ? e : valueItem)));
    },
    [onChange, value],
  );

  useEffect(() => {
    if (!value) onChange?.([]);
  }, [onChange, value]);

  const handleInputDelete = useCallback(
    (key: number) => {
      onChange?.(
        value.filter((_, index) => {
          return index !== key;
        }),
      );
    },
    [onChange, value],
  );

  return (
    <div>
      {Array.isArray(value) &&
        value?.map((valueItem, key) => (
          <FieldWrapper key={key}>
            {!disabled && (
              <>
                <FieldButton
                  type="link"
                  icon={<Icon icon="arrowUp" />}
                  onClick={() => onChange?.(moveItemInArray(value, key, key - 1))}
                  disabled={key === 0}
                />
                <FieldButton
                  type="link"
                  icon={<Icon icon="arrowDown" />}
                  onClick={() => onChange?.(moveItemInArray(value, key, key + 1))}
                  disabled={key === value.length - 1}
                />
              </>
            )}
            <GeometryItem
              supportedTypes={supportedTypes}
              isEditor={isEditor}
              value={valueItem}
              onChange={(value: string) => handleInput(value, key)}
              disabled={disabled}
              errorAdd={() => errorAdd?.(key)}
              errorDelete={() => errorDelete?.(key)}
              workspaceSettings={workspaceSettings}
              settingsLoading={settingsLoading}
            />
            {!disabled && (
              <FieldButton
                type="link"
                icon={<Icon icon="delete" />}
                onClick={() => handleInputDelete(key)}
              />
            )}
          </FieldWrapper>
        ))}
      {!disabled && (
        <Button
          icon={<Icon icon="plus" />}
          type="primary"
          onClick={() => {
            if (!value) value = [];
            onChange?.([...value, ""]);
          }}>
          {t("New")}
        </Button>
      )}
    </div>
  );
};

export default MultiValueGeometry;

const FieldWrapper = styled.div`
  display: flex;
  margin: 8px 0;
`;

const FieldButton = styled(Button)`
  color: #000000d9;
  margin-top: 4px;
`;
