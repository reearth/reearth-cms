import styled from "@emotion/styled";
import { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

import { moveItemInArray } from "../moveItemArray";

type Props = {
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  selectedValues?: string[];
  value?: string[];
};

const MultiValueSelect: React.FC<Props> = ({ disabled, onChange, selectedValues, value = [] }) => {
  const t = useT();
  const { Option } = Select;
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
            <StyledSelect
              disabled={disabled}
              onChange={(e: string) => handleInput(e, key)}
              value={valueItem}>
              {selectedValues?.map((value: string) => (
                <Option key={value} value={value}>
                  {value}
                </Option>
              ))}
            </StyledSelect>
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

export default MultiValueSelect;

const FieldWrapper = styled.div`
  display: flex;
  margin: 8px 0;
`;

const FieldButton = styled(Button)`
  color: #000000d9;
  margin-top: 4px;
`;

const StyledSelect = styled(Select<string>)`
  flex: 1;
  overflow: hidden;
`;
