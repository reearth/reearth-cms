import styled from "@emotion/styled";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import MultiValueSelect from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueSelect";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";
import { requiredValidator } from "../utils";

const { Option } = Select;

const SelectField: React.FC<FieldProps> = ({
  disabled,
  field,
  itemGroupId,
  itemHeights,
  onItemHeightChange,
}) => {
  const t = useT();

  return (
    <StyledFormItem
      extra={field.description}
      label={<FieldTitle isTitle={field.isTitle} isUnique={field.unique} title={field.title} />}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      rules={[
        {
          message: t("Please select an option!"),
          required: field.required,
          validator: requiredValidator,
        },
      ]}>
      {field.multiple ? (
        <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
          <MultiValueSelect disabled={disabled} selectedValues={field.typeProperty?.values} />
        </ResponsiveHeight>
      ) : (
        <Select allowClear disabled={disabled}>
          {field.typeProperty?.values?.map((value: string) => (
            <Option key={value} value={value}>
              {value}
            </Option>
          ))}
        </Select>
      )}
    </StyledFormItem>
  );
};

const StyledFormItem = styled(Form.Item)`
  .ant-select-disabled:not(.ant-select-customize-input) .ant-select-selector {
    color: inherit;
  }
`;

export default SelectField;
