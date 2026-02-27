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
  initialFormValues: Record<string, unknown>;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  referencedItems: FormItem[];
  schema?: Schema;
};

const RequestItemForm: React.FC<Props> = ({
  initialFormValues,
  onGetAsset,
  onGroupGet,
  referencedItems,
  schema,
}) => {
  const [form] = Form.useForm();
  return (
    <StyledForm form={form} initialValues={initialFormValues} layout="vertical">
      <div>
        {schema?.fields.map(field => {
          if (field.type === "Asset") {
            return (
              <div key={field.id}>
                <AssetField disabled field={field} onGetAsset={onGetAsset} />
              </div>
            );
          } else if (field.type === "Reference") {
            return (
              <div key={field.id}>
                <ReferenceField disabled field={field} referencedItems={referencedItems} />
              </div>
            );
          } else if (field.type === "Group") {
            return (
              <div key={field.id}>
                <GroupField
                  assetProps={{ onGetAsset }}
                  disabled
                  field={field}
                  onGroupGet={onGroupGet}
                  referenceProps={{ referencedItems }}
                />
              </div>
            );
          } else {
            const FieldComponent = FIELD_TYPE_COMPONENT_MAP[field.type];
            return (
              <div key={field.id}>
                <FieldComponent disabled field={field} />
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
