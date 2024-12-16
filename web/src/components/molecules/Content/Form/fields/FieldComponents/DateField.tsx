import styled from "@emotion/styled";

import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Form from "@reearth-cms/components/atoms/Form";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";
import { requiredValidator } from "../utils";

type DateFieldProps = {
  field: Field;
  itemGroupId?: string;
  disabled: boolean;
};

const DateField: React.FC<DateFieldProps> = ({ field, itemGroupId, disabled }) => {
  const t = useT();

  return (
    <Form.Item
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
        <MultiValueField type="date" FieldInput={StyledDatePicker} disabled={disabled} />
      ) : (
        <StyledDatePicker disabled={disabled} />
      )}
    </Form.Item>
  );
};

export default DateField;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
`;
