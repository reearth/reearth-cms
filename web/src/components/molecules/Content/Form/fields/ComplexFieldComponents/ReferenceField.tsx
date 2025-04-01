import Form from "@reearth-cms/components/atoms/Form";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import ReferenceFormItem, {
  ReferenceProps,
} from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

type ReferenceFieldProps = FieldProps & ReferenceProps;

const ReferenceField: React.FC<ReferenceFieldProps> = ({
  field,
  disabled,
  itemGroupId,
  itemHeights,
  onItemHeightChange,
  ...props
}) => {
  const t = useT();

  return (
    <Form.Item
      extra={field.description}
      rules={[
        {
          required: field.required,
          message: t("Please input field!"),
        },
      ]}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
      <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
        <ReferenceFormItem
          key={field.id}
          disabled={disabled}
          itemGroupId={itemGroupId}
          fieldId={field.id}
          modelId={field.typeProperty?.modelId}
          titleFieldId={field.typeProperty?.schema?.titleFieldId}
          correspondingField={field.typeProperty?.correspondingField}
          {...props}
        />
      </ResponsiveHeight>
    </Form.Item>
  );
};

export default ReferenceField;
