import styled from "@emotion/styled";

import Form from "@reearth-cms/components/atoms/Form";
import {
  AssetField,
  GroupField,
  ReferenceField,
} from "@reearth-cms/components/molecules/Content/Form/fields/ComplexFieldComponents";
import { FIELD_TYPE_COMPONENT_MAP } from "@reearth-cms/components/molecules/Content/Form/fields/FieldTypesMap";
import { FormItem } from "@reearth-cms/components/molecules/Content/types";
import { Group, Schema } from "@reearth-cms/components/molecules/Schema/types";

type Props = {
  schema?: Schema;
  initialFormValues: Record<string, unknown>;
  referencedItems: FormItem[];
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
};

const RequestItemForm: React.FC<Props> = ({
  schema,
  initialFormValues,
  referencedItems,
  onGetAsset,
  onGroupGet,
}) => {
  const [form] = Form.useForm();
  return (
    <StyledForm form={form} layout="vertical" initialValues={initialFormValues}>
      <div>
        {schema?.fields.map(field => {
          if (field.type === "Asset") {
            return (
              <div key={field.id}>
                <AssetField field={field} disabled onGetAsset={onGetAsset} />
              </div>
            );
          } else if (field.type === "Reference") {
            return (
              <div key={field.id}>
                <ReferenceField field={field} disabled referencedItems={referencedItems} />
              </div>
            );
          } else if (field.type === "Group") {
            return (
              <div key={field.id}>
                <GroupField
                  field={field}
                  disabled
                  onGroupGet={onGroupGet}
                  assetProps={{ onGetAsset }}
                  referenceProps={{ referencedItems }}
                />
              </div>
            );
          } else {
            const FieldComponent = FIELD_TYPE_COMPONENT_MAP[field.type];
            return (
              <div key={field.id}>
                <FieldComponent field={field} disabled />
              </div>
            );
          }
        })}
      </div>
    </StyledForm>
  );
};

export default RequestItemForm;

const StyledForm = styled(Form)`
  padding: 16px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fff;
  label {
    width: 100%;
    display: flex;
  }
  .ant-input-out-of-range input,
  .ant-input-out-of-range textarea {
    color: #ff4d4f !important;
  }
`;
