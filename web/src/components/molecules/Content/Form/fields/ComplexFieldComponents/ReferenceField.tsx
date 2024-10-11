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
  disabled?: boolean;
  onReferenceModelUpdate?: (modelId: string, referenceFieldId: string) => void;
  onSearchTerm?: (term?: string) => void;
  onLinkItemTableReload?: () => void;
  onLinkItemTableChange?: (page: number, pageSize: number) => void;
  onCheckItemReference?: (value: string, correspondingFieldId: string) => Promise<boolean>;
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
        disabled={disabled}
        loading={loading}
        correspondingFieldId={field.id}
        formItemsData={formItemsData}
        modelId={field.typeProperty?.modelId}
        titleFieldId={field.typeProperty?.schema?.titleFieldId}
        onReferenceModelUpdate={onReferenceModelUpdate}
        linkItemModalTitle={linkItemModalTitle}
        linkedItemsModalList={linkedItemsModalList}
        linkItemModalTotalCount={linkItemModalTotalCount}
        linkItemModalPage={linkItemModalPage}
        linkItemModalPageSize={linkItemModalPageSize}
        onSearchTerm={onSearchTerm}
        onLinkItemTableReload={onLinkItemTableReload}
        onLinkItemTableChange={onLinkItemTableChange}
        onCheckItemReference={onCheckItemReference}
      />
    </Form.Item>
  );
};

export default ReferenceField;
