import Form from "@reearth-cms/components/atoms/Form";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import ReferenceFormItem from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { FormItem } from "@reearth-cms/components/molecules/Content/types";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

type ReferenceFieldProps = {
  field: Field;
  itemGroupId?: string;
  loading?: boolean;
  linkedItemsModalList?: FormItem[];
  formItemsData?: FormItem[];
  linkItemModalTitle?: string;
  linkItemModalTotalCount?: number;
  linkItemModalPage?: number;
  linkItemModalPageSize?: number;
  disabled: boolean;
  onReferenceModelUpdate?: (modelId: string, referenceFieldId: string) => void;
  onSearchTerm?: (term?: string) => void;
  onLinkItemTableReload?: () => void;
  onLinkItemTableChange?: (page: number, pageSize: number) => void;
  onCheckItemReference?: (
    itemId: string,
    correspondingFieldId: string,
    groupId?: string,
  ) => Promise<boolean>;
};

const ReferenceField: React.FC<ReferenceFieldProps> = ({
  field,
  itemGroupId,
  loading,
  linkedItemsModalList,
  formItemsData,
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  disabled,
  onReferenceModelUpdate,
  onSearchTerm,
  onLinkItemTableReload,
  onLinkItemTableChange,
  onCheckItemReference,
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
      <ReferenceFormItem
        key={field.id}
        linkedItemsModalList={linkedItemsModalList}
        disabled={disabled}
        loading={loading}
        fieldId={field.id}
        itemGroupId={itemGroupId}
        formItemsData={formItemsData}
        correspondingField={field.typeProperty?.correspondingField}
        modelId={field.typeProperty?.modelId}
        titleFieldId={field.typeProperty?.schema?.titleFieldId}
        linkItemModalTitle={linkItemModalTitle}
        linkItemModalTotalCount={linkItemModalTotalCount}
        linkItemModalPage={linkItemModalPage}
        linkItemModalPageSize={linkItemModalPageSize}
        onReferenceModelUpdate={onReferenceModelUpdate}
        onSearchTerm={onSearchTerm}
        onLinkItemTableReload={onLinkItemTableReload}
        onLinkItemTableChange={onLinkItemTableChange}
        onCheckItemReference={onCheckItemReference}
      />
    </Form.Item>
  );
};

export default ReferenceField;
