import styled from "@emotion/styled";
import { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { moveItemInArray } from "../moveItemArray";

type Props = {
  selectedValues?: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
};

const MultiValueSelect: React.FC<Props> = ({ selectedValues, value = [], onChange, disabled }) => {
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
                  color="default"
                  variant="link"
                  icon={<Icon icon="arrowUp" size={AntdToken.FONT.SIZE_LG} />}
                  onClick={() => onChange?.(moveItemInArray(value, key, key - 1))}
                  disabled={key === 0}
                />
                <FieldButton
                  color="default"
                  variant="link"
                  icon={<Icon icon="arrowDown" size={AntdToken.FONT.SIZE_LG} />}
                  onClick={() => onChange?.(moveItemInArray(value, key, key + 1))}
                  disabled={key === value.length - 1}
                />
              </>
            )}
            <StyledSelect
              disabled={disabled}
              value={valueItem}
              onChange={(e: string) => handleInput(e, key)}
              options={selectedValues?.map((value: string) => ({
                value,
                label: value,
              }))}
            />
            {!disabled && (
              <FieldButton
                color="default"
                variant="link"
                icon={<Icon icon="delete" size={AntdToken.FONT.SIZE_LG} />}
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

export default MultiValueSelect;

const FieldWrapper = styled.div`
  display: flex;
  margin: ${AntdToken.SPACING.XS}px 0;
`;

const FieldButton = styled(Button)`
  color: ${AntdColor.NEUTRAL.TEXT};
  margin-top: ${AntdToken.SPACING.XXS}px;
`;

const StyledSelect = styled(Select<string>)`
  flex: 1;
  overflow: hidden;
`;
