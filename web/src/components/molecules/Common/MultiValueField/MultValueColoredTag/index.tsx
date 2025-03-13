import styled from "@emotion/styled";
import { ChangeEvent, useCallback, useEffect, useState, useRef } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input, { InputProps } from "@reearth-cms/components/atoms/Input";
import Tag from "@reearth-cms/components/atoms/Tag";
import { TextAreaProps } from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";

import { moveItemInArray } from "../moveItemArray";

const colors = [
  "MAGENTA",
  "RED",
  "VOLCANO",
  "ORANGE",
  "GOLD",
  "LIME",
  "GREEN",
  "CYAN",
  "BLUE",
  "GEEKBLUE",
  "PURPLE",
] as const;

type TagColor = (typeof colors)[number];

type Props = {
  value?: { id?: string; name: string; color: TagColor }[];
  onChange?: (value: { id?: string; name: string; color: TagColor }[]) => void;
  errorIndexes: Set<number>;
} & TextAreaProps &
  InputProps;

const MultiValueColoredTag: React.FC<Props> = ({
  value = [],
  onChange,
  errorIndexes,
  ...props
}) => {
  const t = useT();
  const [lastColorIndex, setLastColorIndex] = useState(0);
  const [focusedTagIndex, setFocusedTagIndex] = useState<number | null>(null); // New State to hold the focused tag index
  const divRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleColorChange = useCallback(
    (color: TagColor, key: number) => {
      onChange?.(
        value?.map((valueItem, index) => (index === key ? { ...valueItem, color } : valueItem)),
      );
    },
    [onChange, value],
  );

  const generateMenuItems = useCallback(
    (key: number) => {
      return colors.map((color: TagColor) => ({
        key: color,
        label: (
          <div onClick={() => handleColorChange(color, key)}>
            <Tag color={color.toLowerCase()}>{t("Tag")}</Tag>
            {t(color.toLowerCase())}
          </div>
        ),
      }));
    },
    [handleColorChange, t],
  );

  const handleNewTag = useCallback(() => {
    const newColor = colors[lastColorIndex];
    const payload = !value ? [] : [...value];
    onChange?.([...payload, { color: newColor, name: "Tag" }]);
    setLastColorIndex((lastColorIndex + 1) % colors.length);
  }, [lastColorIndex, onChange, value]);

  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement | undefined>, id: number) => {
      onChange?.(
        value?.map((valueItem, index) =>
          index === id
            ? { id: valueItem?.id, color: valueItem.color, name: e?.target.value }
            : valueItem,
        ),
      );
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

  const handleTagClick = useCallback((index: number) => {
    setFocusedTagIndex(index);
  }, []);

  useEffect(() => {
    if (focusedTagIndex !== null) {
      const inputElem = divRefs.current[focusedTagIndex]?.querySelector("input");
      inputElem?.focus();
    }
  }, [focusedTagIndex]);

  const handleInputBlur = useCallback(() => {
    setFocusedTagIndex(null);
  }, []);

  return (
    <div>
      {Array.isArray(value) &&
        value?.map((valueItem, key) => (
          <FieldWrapper key={key}>
            {!props.disabled && (
              <>
                <FieldButton
                  color="default"
                  variant="link"
                  icon={<Icon icon="arrowUp" size={16} />}
                  onClick={() => onChange?.(moveItemInArray(value, key, key - 1))}
                  disabled={key === 0}
                />
                <FieldButton
                  color="default"
                  variant="link"
                  icon={<Icon icon="arrowDown" size={16} />}
                  onClick={() => onChange?.(moveItemInArray(value, key, key + 1))}
                  disabled={key === value.length - 1}
                />
              </>
            )}
            <StyledDiv hidden={focusedTagIndex !== key} ref={el => (divRefs.current[key] = el)}>
              <StyledInput
                {...props}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInput(e, key)}
                value={valueItem.name}
                onBlur={() => handleInputBlur()}
                isError={errorIndexes?.has(key)}
              />
            </StyledDiv>
            <StyledTagContainer
              hidden={focusedTagIndex === key} // Hide tag when it is focused
              onClick={() => handleTagClick(key)}
              isError={errorIndexes?.has(key)}>
              <StyledTag color={valueItem.color.toLowerCase()}>{valueItem.name}</StyledTag>
            </StyledTagContainer>
            <Dropdown menu={{ items: generateMenuItems(key) }} trigger={["click"]}>
              <FieldButton
                color="default"
                variant="link"
                icon={<Icon icon="colorPalette" size={16} />}
              />
            </Dropdown>
            {!props.disabled && (
              <FieldButton
                color="default"
                variant="link"
                icon={<Icon icon="delete" size={16} />}
                onClick={() => handleInputDelete(key)}
              />
            )}
          </FieldWrapper>
        ))}
      {!props.disabled && (
        <Button icon={<Icon icon="plus" />} type="primary" onClick={handleNewTag}>
          {t("New")}
        </Button>
      )}
    </div>
  );
};

export default MultiValueColoredTag;

const FieldWrapper = styled.div`
  display: flex;
  margin: 8px 0;
`;

const FieldButton = styled(Button)`
  color: #000000d9;
  margin-top: 4px;
`;

const StyledDiv = styled.div`
  width: 100%;
`;

const StyledInput = styled(Input)`
  flex: 1;
`;

const StyledTagContainer = styled.div<{ isError?: boolean }>`
  cursor: pointer;
  border: 1px solid ${({ isError }) => (isError ? "#ff4d4f" : "#d9d9d9")};
  padding: 4px 11px;
  overflow: auto;
  height: 100%;
  width: 100% !important;
  line-height: 1;
  word-break: break-all;
`;

const StyledTag = styled(Tag)`
  flex: 1;
  margin-right: 8px;
`;
