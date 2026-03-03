import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import { FormInstance } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import { ReferenceProps } from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { Field, FieldProps, Group } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { newID } from "@reearth-cms/utils/id";

import { AssetProps } from "../../Form/AssetItem";
import GroupItem from "../../Form/GroupItem";
import { moveItemInArray } from "../moveItemArray";

type Props = {
  assetProps: AssetProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: FormInstance<any>;
  onChange?: (value: string[]) => void;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  referenceProps: ReferenceProps;
  value?: string[];
} & FieldProps;

const MultiValueGroup: React.FC<Props> = ({
  assetProps,
  disabled,
  field,
  form,
  itemHeights,
  onChange,
  onGroupGet,
  onItemHeightChange,
  referenceProps,
  value = [],
}) => {
  const t = useT();

  useEffect(() => {
    if (!value) onChange?.([]);
  }, [onChange, value]);

  const handleInputDelete = useCallback(
    (key: number) => {
      onChange?.(
        value.filter((_, index: number) => {
          return index !== key;
        }),
      );
    },
    [onChange, value],
  );

  const handleAdd = useCallback(async () => {
    const currentValues = value || [];
    const itemGroupId = newID();

    if (Array.isArray(currentValues)) {
      onChange?.([...currentValues, itemGroupId]);
    } else {
      onChange?.([currentValues, itemGroupId]);
    }

    // set default value
    const newValues = { ...form?.getFieldsValue() };
    if (!field.typeProperty?.groupId) return;
    const group = await onGroupGet(field.typeProperty.groupId);
    group?.schema.fields.forEach((field: Field) => {
      const defaultValue = field.typeProperty?.defaultValue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const setValue = (value: any) => {
        if (typeof newValues[field.id] === "object" && !Array.isArray(newValues[field.id])) {
          form?.setFieldValue([field.id, itemGroupId], value);
        } else {
          form?.setFieldValue(field.id, { [itemGroupId]: value });
        }
      };

      switch (field.type) {
        case "Select":
          setValue(field.typeProperty?.selectDefaultValue);
          break;
        case "Integer":
          setValue(field.typeProperty?.integerDefaultValue);
          break;
        case "Asset":
          setValue(field.typeProperty?.assetDefaultValue);
          break;
        case "Date":
          if (Array.isArray(defaultValue)) {
            setValue(defaultValue.map(valueItem => (valueItem ? dayjs(valueItem as string) : "")));
          } else if (defaultValue) {
            setValue(dayjs(defaultValue as string));
          } else {
            form?.setFieldValue([field.id, itemGroupId], "");
          }
          break;
        default:
          setValue(defaultValue);
          break;
      }
    });
  }, [form, onChange, onGroupGet, field.typeProperty?.groupId, value]);

  return (
    <div>
      {Array.isArray(value) &&
        value?.map((valueItem, key) => {
          return (
            <FieldWrapper key={key}>
              <GroupItem
                assetProps={assetProps}
                disabled={disabled}
                disableMoveDown={key === value.length - 1}
                disableMoveUp={key === 0}
                itemHeights={itemHeights}
                onDelete={() => handleInputDelete(key)}
                onGroupGet={onGroupGet}
                onItemHeightChange={onItemHeightChange}
                onMoveDown={() => onChange?.(moveItemInArray(value, key, key + 1))}
                onMoveUp={() => onChange?.(moveItemInArray(value, key, key - 1))}
                order={key}
                parentField={field}
                referenceProps={referenceProps}
                value={valueItem}
              />
            </FieldWrapper>
          );
        })}
      {!disabled && (
        <Button icon={<Icon icon="plus" />} onClick={handleAdd} type="primary">
          {t("New")}
        </Button>
      )}
    </div>
  );
};

export default MultiValueGroup;

const FieldWrapper = styled.div`
  display: flex;
  margin: 8px 0;
`;
