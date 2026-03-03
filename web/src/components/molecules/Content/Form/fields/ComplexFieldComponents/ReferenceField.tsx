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
  disabled,
  field,
  itemGroupId,
  itemHeights,
  onItemHeightChange,
  ...props
}) => {
  const t = useT();

  return (
    <Form.Item
      extra={field.description}
      label={<FieldTitle isTitle={false} isUnique={field.unique} title={field.title} />}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      rules={[
        {
          message: t("Please input field!"),
          required: field.required,
        },
      ]}>
      <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
        <ReferenceFormItem
          correspondingField={field.typeProperty?.correspondingField}
          disabled={disabled}
          fieldId={field.id}
          itemGroupId={itemGroupId}
          key={field.id}
          modelId={field.typeProperty?.modelId}
          titleFieldId={field.typeProperty?.schema?.titleFieldId}
          {...props}
        />
      </ResponsiveHeight>
    </Form.Item>
  );
};

export default ReferenceField;
