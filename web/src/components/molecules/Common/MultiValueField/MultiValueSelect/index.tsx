import styled from "@emotion/styled";
import { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import { moveItemInArray } from "../moveItemArray";

type Props = {
  selectedValues?: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
};

const MultiValueSelect: React.FC<Props> = ({ selectedValues, value = [], onChange, disabled }) => {
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
                  variant="link"
                  data-testid={DATA_TEST_ID.MultiValueField__ArrowUpButton}
                  icon={<Icon icon="arrowUp" size={16} />}
                  onClick={() => onChange?.(moveItemInArray(value, key, key - 1))}
                  disabled={key === 0}
                />
                <FieldButton
                  color="default"
                  variant="link"
                  data-testid={DATA_TEST_ID.MultiValueField__ArrowDownButton}
                  icon={<Icon icon="arrowDown" size={16} />}
                  onClick={() => onChange?.(moveItemInArray(value, key, key + 1))}
                  disabled={key === value.length - 1}
                />
              </>
            )}
            <StyledSelect
              data-testid={DATA_TEST_ID.FieldModal__SelectValueItem}
              disabled={disabled}
              value={valueItem}
              onChange={(e: string) => handleInput(e, key)}>
              {selectedValues?.map((value: string) => (
                <Option key={value} value={value}>
                  {value}
                </Option>
              ))}
            </StyledSelect>
            {!disabled && (
              <FieldButton
                color="default"
                variant="link"
                data-testid={DATA_TEST_ID.MultiValueField__DeleteButton}
                icon={<Icon icon="delete" size={16} />}
                onClick={() => handleInputDelete(key)}
              />
            )}
          </FieldWrapper>
        ))}
      {!disabled && (
        <Button
          icon={<Icon icon="plus" />}
          type="primary"
          data-testid={DATA_TEST_ID.FieldModal__PlusNewButton}
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
