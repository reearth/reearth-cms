import styled from "@emotion/styled";
import React, { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

import { moveItemInArray } from "../moveItemArray";

type Props = {
  className?: string;
  selectedValues: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
};

const MultiValueSelect: React.FC<Props> = ({
  className,
  selectedValues,
  value = [],
  onChange,
  ...props
}) => {
  console.log(value);

  const t = useT();
  const { Option } = Select;
  const handleInput = useCallback(
    (e: string, id: number) => {
      onChange?.(value?.map((valueItem, index) => (index === id ? e : valueItem)));
    },
    [onChange, value],
  );

  const deleteInput = useCallback(
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
    <div className={className}>
      {Array.isArray(value) &&
        value?.map((valueItem, key) => (
          <FieldWrapper key={key}>
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
            <Select
              style={{ flex: 1 }}
              {...props}
              value={valueItem}
              onChange={(e: string) => handleInput(e, key)}>
              {selectedValues?.map((value: string) => (
                <Option key={value} value={value}>
                  {value}
                </Option>
              ))}
            </Select>
            <FieldButton
              type="link"
              icon={<Icon icon="delete" />}
              onClick={() => deleteInput(key)}
            />
          </FieldWrapper>
        ))}
      <Button
        icon={<Icon icon="plus" />}
        type="primary"
        onClick={() => {
          if (!value) value = [];
          onChange?.([...value, ""]);
        }}>
        {t("New")}
      </Button>
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
