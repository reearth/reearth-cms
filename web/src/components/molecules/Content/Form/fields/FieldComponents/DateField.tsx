import styled from "@emotion/styled";

import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Form from "@reearth-cms/components/atoms/Form";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";

interface DateFieldProps {
  field: Field;
  handleBlurUpdate?: () => void;
}

const DateField: React.FC<DateFieldProps> = ({ field }) => {
  const t = useT();

  return (
    <Form.Item
      extra={field.description}
      name={field.id}
      rules={[
        {
          required: field.required,
          message: t("Please input field!"),
        },
      ]}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      {field.multiple ? (
        <MultiValueField type="date" FieldInput={StyledDatePicker} />
      ) : (
        <StyledDatePicker />
      )}
    </Form.Item>
  );
};

export default DateField;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
`;
