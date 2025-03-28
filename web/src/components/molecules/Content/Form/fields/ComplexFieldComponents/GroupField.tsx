import Form, { FormInstance } from "@reearth-cms/components/atoms/Form";
import { AssetProps } from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import GroupItem from "@reearth-cms/components/molecules/Common/Form/GroupItem";
import MultiValueGroup from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGroup";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import { ReferenceProps } from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { FieldProps, Group } from "@reearth-cms/components/molecules/Schema/types";

type GroupFieldProps = FieldProps & {
  form?: FormInstance<unknown>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  assetProps: AssetProps;
  referenceProps: ReferenceProps;
};

const GroupField: React.FC<GroupFieldProps> = ({
  field,
  disabled,
  itemHeights,
  onItemHeightChange,
  form,
  onGroupGet,
  assetProps,
  referenceProps,
}) => {
  return (
    <Form.Item
      extra={field.description}
      name={field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
        {field.multiple ? (
          <MultiValueGroup
            field={field}
            disabled={disabled}
            itemHeights={itemHeights}
            onItemHeightChange={onItemHeightChange}
            form={form}
            onGroupGet={onGroupGet}
            assetProps={assetProps}
            referenceProps={referenceProps}
          />
        ) : (
          <GroupItem
            disabled={disabled}
            parentField={field}
            itemHeights={itemHeights}
            onItemHeightChange={onItemHeightChange}
            onGroupGet={onGroupGet}
            assetProps={assetProps}
            referenceProps={referenceProps}
          />
        )}
      </ResponsiveHeight>
    </Form.Item>
  );
};

export default GroupField;
