import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import { FormInstance } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import { ReferenceProps } from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { Field, Group, FieldProps } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { newID } from "@reearth-cms/utils/id";

import { AssetProps } from "../../Form/AssetItem";
import GroupItem from "../../Form/GroupItem";
import { moveItemInArray } from "../moveItemArray";

type Props = FieldProps & {
  value?: string[];
  onChange?: (value: string[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: FormInstance<any>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  assetProps: AssetProps;
  referenceProps: ReferenceProps;
};

const MultiValueGroup: React.FC<Props> = ({
  value = [],
  onChange,
  field,
  disabled,
  itemHeights,
  onItemHeightChange,
  form,
  onGroupGet,
  assetProps,
  referenceProps,
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
                value={valueItem}
                parentField={field}
                disabled={disabled}
                itemHeights={itemHeights}
                onItemHeightChange={onItemHeightChange}
                order={key}
                onMoveUp={() => onChange?.(moveItemInArray(value, key, key - 1))}
                onMoveDown={() => onChange?.(moveItemInArray(value, key, key + 1))}
                onDelete={() => handleInputDelete(key)}
                disableMoveUp={key === 0}
                disableMoveDown={key === value.length - 1}
                onGroupGet={onGroupGet}
                assetProps={assetProps}
                referenceProps={referenceProps}
              />
            </FieldWrapper>
          );
        })}
      {!disabled && (
        <Button icon={<Icon icon="plus" />} type="primary" onClick={handleAdd}>
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
