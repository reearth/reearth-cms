import { FormInstance } from "@reearth-cms/components/atoms/Form";
import { AssetProps } from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import { ReferenceProps } from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { Field as FieldType, Group } from "@reearth-cms/components/molecules/Schema/types";

import { AssetField, GroupField, ReferenceField } from "./fields/ComplexFieldComponents";
import { FIELD_TYPE_COMPONENT_MAP } from "./fields/FieldTypesMap";

type Props = {
  assetProps: AssetProps;
  disabled: boolean;
  field: FieldType;
  groupProps: {
    form: FormInstance<unknown>;
    onGroupGet: (id: string) => Promise<Group | undefined>;
  };
  itemHeights?: Record<string, number>;
  onItemHeightChange?: (id: string, height: number) => void;
  referenceProps: ReferenceProps;
};

const Field: React.FC<Props> = ({
  assetProps,
  disabled,
  field,
  groupProps,
  itemHeights,
  onItemHeightChange,
  referenceProps,
}) => {
  if (field.type === "Asset") {
    return (
      <AssetField
        disabled={disabled}
        field={field}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
        {...assetProps}
      />
    );
  } else if (field.type === "Reference") {
    return (
      <ReferenceField
        disabled={disabled}
        field={field}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
        {...referenceProps}
      />
    );
  } else if (field.type === "Group") {
    return (
      <GroupField
        assetProps={assetProps}
        disabled={disabled}
        field={field}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
        referenceProps={referenceProps}
        {...groupProps}
      />
    );
  } else {
    const FieldComponent = FIELD_TYPE_COMPONENT_MAP[field.type];
    return (
      <FieldComponent
        disabled={disabled}
        field={field}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
      />
    );
  }
};

export default Field;
