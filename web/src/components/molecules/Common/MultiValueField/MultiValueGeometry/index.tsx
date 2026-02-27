import styled from "@emotion/styled";
import { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import GeometryItem from "@reearth-cms/components/molecules/Common/Form/GeometryItem";
import {
  EditorSupportedType,
  ObjectSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import { moveItemInArray } from "../moveItemArray";

type Props = {
  disabled?: boolean;
  errorAdd?: (index: number) => void;
  errorDelete?: (index: number) => void;
  isEditor: boolean;
  onChange?: (value: string[]) => void;
  supportedTypes?: EditorSupportedType | ObjectSupportedType[];
  value?: string[];
};

const MultiValueGeometry: React.FC<Props> = ({
  disabled,
  errorAdd,
  errorDelete,
  isEditor,
  onChange,
  supportedTypes,
  value = [],
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
      errorDelete?.(key);
    },
    [errorDelete, onChange, value],
  );

  return (
    <div>
      {Array.isArray(value) &&
        value?.map((valueItem, key) => (
          <FieldWrapper key={key}>
            {!disabled && (
              <>
                <FieldButton
                  color="default"
                  disabled={key === 0}
                  icon={<Icon icon="arrowUp" size={16} />}
                  onClick={() => onChange?.(moveItemInArray(value, key, key - 1))}
                  variant="link"
                />
                <FieldButton
                  color="default"
                  disabled={key === value.length - 1}
                  icon={<Icon icon="arrowDown" size={16} />}
                  onClick={() => onChange?.(moveItemInArray(value, key, key + 1))}
                  variant="link"
                />
              </>
            )}
            <GeometryItem
              disabled={disabled}
              errorAdd={() => errorAdd?.(key)}
              errorDelete={() => errorDelete?.(key)}
              isEditor={isEditor}
              onChange={(value: string) => handleInput(value, key)}
              supportedTypes={supportedTypes}
              value={valueItem}
            />
            {!disabled && (
              <FieldButton
                color="default"
                icon={<Icon icon="delete" size={16} />}
                onClick={() => handleInputDelete(key)}
                variant="link"
              />
            )}
          </FieldWrapper>
        ))}
      {!disabled && (
        <Button
          icon={<Icon icon="plus" />}
          onClick={() => {
            if (!value) value = [];
            onChange?.([...value, ""]);
          }}
          type="primary">
          {t("New")}
        </Button>
      )}
    </div>
  );
};

export default MultiValueGeometry;

const FieldWrapper = styled.div`
  display: flex;
  margin-bottom: 24px;
`;

const FieldButton = styled(Button)`
  color: #000000d9;
  margin-top: 4px;
`;
