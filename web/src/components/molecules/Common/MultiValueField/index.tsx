import styled from "@emotion/styled";
import React, { ChangeEvent } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";

import { moveItemInArray } from "./moveItemArray";

type Props = {
  className?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  FieldInput: React.FunctionComponent<any>;
};

const MultiValueField: React.FC<Props> = ({
  className,
  value = [],
  onChange,
  FieldInput,
  ...props
}) => {
  const t = useT();
  const handleInput = (e: ChangeEvent<HTMLInputElement>, id: number) => {
    onChange?.(value?.map((valueItem, index) => (index === id ? e.target.value : valueItem)));
  };

  const deleteInput = (key: number) => {
    onChange?.(
      value.filter((_, index) => {
        console.log(index, key);
        return index !== key;
      }),
    );
  };

  return (
    <div className={className}>
      {value?.map((valueItem, key) => (
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
          <FieldInput
            style={{ flex: 1, padding: 4 }}
            {...props}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInput(e, key)}
            value={valueItem}
            rows={1}
            showCount
          />
          <FieldButton type="link" icon={<Icon icon="delete" />} onClick={() => deleteInput(key)} />
        </FieldWrapper>
      ))}
      <Button
        icon={<Icon icon="plus" />}
        type="primary"
        onClick={() => {
          onChange?.([...value, ""]);
        }}>
        {t("New")}
      </Button>
    </div>
  );
};

export default MultiValueField;

const FieldWrapper = styled.div`
  display: flex;
`;

const FieldButton = styled(Button)`
  color: #000000d9;
  margin-top: 4px;
`;
