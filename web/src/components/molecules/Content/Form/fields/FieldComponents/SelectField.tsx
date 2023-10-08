import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import MultiValueSelect from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueSelect";
import { Field } from "@reearth-cms/components/molecules/Schema/types";

import FieldTitle from "../../FieldTitle";

interface DefaultFieldProps {
  field: Field;
}

const SelectField: React.FC<DefaultFieldProps> = ({ field }) => {
  const { Option } = Select;

  return (
    <Form.Item
      extra={field.description}
      name={field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}>
      {field.multiple ? (
        <MultiValueSelect selectedValues={field.typeProperty?.values} />
      ) : (
        <Select allowClear>
          {field.typeProperty?.values?.map((value: string) => (
            <Option key={value} value={value}>
              {value}
            </Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
};

export default SelectField;
