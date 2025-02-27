import styled from "@emotion/styled";

import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Form from "@reearth-cms/components/atoms/Form";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import ResponsiveHeight from "@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";
import { requiredValidator } from "../utils";

const DateField: React.FC<FieldProps> = ({
  field,
  itemGroupId,
  disabled,
  itemHeights,
  onItemHeightChange,
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
          <MultiValueField type="date" FieldInput={StyledDatePicker} disabled={disabled} />
        </ResponsiveHeight>
      ) : (
        <StyledDatePicker disabled={disabled} />
      )}
    </StyledFormItem>
  );
};

const StyledFormItem = styled(Form.Item)`
  .ant-picker-disabled,
  .ant-picker-input > input[disabled] {
    color: inherit;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
`;

export default DateField;
