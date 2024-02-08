import Form from "@reearth-cms/components/atoms/Form";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import ReferenceFormItem from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { FormItem } from "@reearth-cms/components/molecules/Content/types";
import { Field } from "@reearth-cms/components/molecules/Schema/types";

interface ReferenceFieldProps {
  field: Field;
  linkedItemsModalList?: FormItem[];
  formItemsData: FormItem[];
  linkItemModalTitle: string;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onReferenceModelUpdate: (modelId?: string) => void;
  onSearchTerm: (term?: string) => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
}

const ReferenceField: React.FC<ReferenceFieldProps> = ({
  field,
  linkedItemsModalList,
  formItemsData,
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onReferenceModelUpdate,
  onSearchTerm,
  onLinkItemTableChange,
}) => {
  return (
    <Form.Item
      extra={field.description}
      name={field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
      <ReferenceFormItem
        key={field.id}
        correspondingFieldId={field.id}
        formItemsData={formItemsData}
        modelId={field.typeProperty?.modelId}
        onReferenceModelUpdate={onReferenceModelUpdate}
        linkItemModalTitle={linkItemModalTitle}
        linkedItemsModalList={linkedItemsModalList}
        linkItemModalTotalCount={linkItemModalTotalCount}
        linkItemModalPage={linkItemModalPage}
        linkItemModalPageSize={linkItemModalPageSize}
        onSearchTerm={onSearchTerm}
        onLinkItemTableChange={onLinkItemTableChange}
      />
    </Form.Item>
  );
};

export default ReferenceField;
