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
          message: t("Please input field!"),
          required: field.required,
          validator: requiredValidator,
        },
      ]}>
      {field.multiple ? (
        <ResponsiveHeight itemHeights={itemHeights} onItemHeightChange={onItemHeightChange}>
          <MultiValueField disabled={disabled} FieldInput={StyledDatePicker} type="date" />
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
