import styled from "@emotion/styled";

import Form from "@reearth-cms/components/atoms/Form";
import AssetItem, { AssetProps } from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import MultiValueAsset from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueAsset";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import { requiredValidator } from "../utils";

type AssetFieldProps = FieldProps & AssetProps;

const AssetField: React.FC<AssetFieldProps> = ({
  field,
  disabled,
  itemGroupId,
  itemHeights,
  onItemHeightChange,
  ...props
}) => {
  const t = useT();

  return (
    <StyledFormItem
      extra={field.description}
      rules={[
        {
          required: field.required,
          validator: requiredValidator,
          message: t("Please input field!"),
        },
      ]}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      {field.multiple ? (
        <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
          <MultiValueAsset disabled={disabled} {...props} />
        </ResponsiveHeight>
      ) : (
        <AssetItem key={field.id} disabled={disabled} {...props} />
      )}
    </StyledFormItem>
  );
};

const StyledFormItem = styled(Form.Item)`
  .ant-btn-default:disabled {
    color: inherit;
  }
`;

export default AssetField;
