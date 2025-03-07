import { FormInstance } from "@reearth-cms/components/atoms/Form";
import { AssetProps } from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import { ReferenceProps } from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { Field as FieldType, Group } from "@reearth-cms/components/molecules/Schema/types";

import { AssetField, GroupField, ReferenceField } from "./fields/ComplexFieldComponents";
import { FIELD_TYPE_COMPONENT_MAP } from "./fields/FieldTypesMap";

type Props = {
  field: FieldType;
  disabled: boolean;
  itemHeights?: Record<string, number>;
  onItemHeightChange?: (id: string, height: number) => void;
  assetProps: AssetProps;
  referenceProps: ReferenceProps;
  groupProps: {
    onGroupGet: (id: string) => Promise<Group | undefined>;
    form: FormInstance<unknown>;
  };
};

const Field: React.FC<Props> = ({
  field,
  disabled,
  itemHeights,
  onItemHeightChange,
  assetProps,
  referenceProps,
  groupProps,
}) => {
  if (field.type === "Asset") {
    return (
      <AssetField
        field={field}
        disabled={disabled}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
        {...assetProps}
      />
    );
  } else if (field.type === "Reference") {
    return (
      <ReferenceField
        field={field}
        disabled={disabled}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
        {...referenceProps}
      />
    );
  } else if (field.type === "Group") {
    return (
      <GroupField
        field={field}
        disabled={disabled}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
        assetProps={assetProps}
        referenceProps={referenceProps}
        {...groupProps}
      />
    );
  } else {
    const FieldComponent = FIELD_TYPE_COMPONENT_MAP[field.type];
    return (
      <FieldComponent
        field={field}
        disabled={disabled}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
      />
    );
  }
};

export default Field;
