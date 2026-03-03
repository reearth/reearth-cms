import styled from "@emotion/styled";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";

import { moveItemInArray } from "../moveItemArray";

type Props = {
  checked?: boolean[];
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FieldInput: React.FunctionComponent<any>;
  onChange?: (value: (boolean | number | string)[]) => void;
};

const MultiValueBooleanField: React.FC<Props> = ({
  checked = [],
  disabled,
  FieldInput,
  onChange,
}) => {
  const t = useT();
  const handleInput = useCallback(
    (e: boolean | CheckboxChangeEvent, id: number) => {
      const value = typeof e === "boolean" ? e : e.target.checked;
      onChange?.(checked?.map((valueItem, index) => (index === id ? value : valueItem)));
    },
    [onChange, checked],
  );

  useEffect(() => {
    if (typeof checked === "string" || typeof checked === "boolean") onChange?.([checked]);
    else if (!checked) onChange?.([]);
  }, [onChange, checked]);

  const handleInputDelete = useCallback(
    (key: number) => {
      onChange?.(
        checked.filter((_, index) => {
          return index !== key;
        }),
      );
    },
    [onChange, checked],
  );

  return (
    <div>
      {Array.isArray(checked) &&
        checked?.map((valueItem, key) => (
          <FieldWrapper key={key}>
            {!disabled && (
              <>
                <FieldButton
                  color="default"
                  disabled={key === 0}
                  icon={<Icon icon="arrowUp" size={16} />}
                  onClick={() => onChange?.(moveItemInArray(checked, key, key - 1))}
                  variant="link"
                />
                <FieldButton
                  color="default"
                  disabled={key === checked.length - 1}
                  icon={<Icon icon="arrowDown" size={16} />}
                  onClick={() => onChange?.(moveItemInArray(checked, key, key + 1))}
                  variant="link"
                />
              </>
            )}
            <FieldInput
              checked={valueItem}
              disabled={disabled}
              onChange={(e: boolean | CheckboxChangeEvent) => handleInput(e, key)}
            />

            <FlexSpace />
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
            if (!checked) checked = [];
            onChange?.([...checked, false]);
          }}
          type="primary">
          {t("New")}
        </Button>
      )}
    </div>
  );
};

export default MultiValueBooleanField;

const FieldWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;
`;

const FieldButton = styled(Button)`
  color: #000000d9;
  margin-top: 4px;
`;

const FlexSpace = styled.div`
  flex: 1;
`;
