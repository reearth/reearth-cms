import Form, { FormInstance } from "@reearth-cms/components/atoms/Form";
import { AssetProps } from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import GroupItem from "@reearth-cms/components/molecules/Common/Form/GroupItem";
import MultiValueGroup from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGroup";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import { ReferenceProps } from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { FieldProps, Group } from "@reearth-cms/components/molecules/Schema/types";

type GroupFieldProps = {
  assetProps: AssetProps;
  form?: FormInstance<unknown>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  referenceProps: ReferenceProps;
} & FieldProps;

const GroupField: React.FC<GroupFieldProps> = ({
  assetProps,
  disabled,
  field,
  form,
  itemHeights,
  onGroupGet,
  onItemHeightChange,
  referenceProps,
}) => {
  return (
    <Form.Item
      extra={field.description}
      label={<FieldTitle isTitle={field.isTitle} isUnique={field.unique} title={field.title} />}
      name={field.id}>
      <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
        {field.multiple ? (
          <MultiValueGroup
            assetProps={assetProps}
            disabled={disabled}
            field={field}
            form={form}
            itemHeights={itemHeights}
            onGroupGet={onGroupGet}
            onItemHeightChange={onItemHeightChange}
            referenceProps={referenceProps}
          />
        ) : (
          <GroupItem
            assetProps={assetProps}
            disabled={disabled}
            itemHeights={itemHeights}
            onGroupGet={onGroupGet}
            onItemHeightChange={onItemHeightChange}
            parentField={field}
            referenceProps={referenceProps}
          />
        )}
      </ResponsiveHeight>
    </Form.Item>
  );
};

export default GroupField;
