import styled from "@emotion/styled";

import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Form from "@reearth-cms/components/atoms/Form";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";

import FieldTitle from "../../FieldTitle";

interface DateFieldProps {
  field: Field;
  handleMetaUpdate: () => void;
  t: (key: string) => string;
}

const DateField: React.FC<DateFieldProps> = ({ field, handleMetaUpdate, t }) => {
  return (
    <Form.Item
      extra={field.description}
      rules={[
        {
          required: field.required,
          message: t("Please input field!"),
        },
      ]}
      name={field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
      {field.multiple ? (
        <MultiValueField onBlur={handleMetaUpdate} type="date" FieldInput={StyledDatePicker} />
      ) : (
        <StyledDatePicker onBlur={handleMetaUpdate} />
      )}
    </Form.Item>
  );
};

export default DateField;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
`;
