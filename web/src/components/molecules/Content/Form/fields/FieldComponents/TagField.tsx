import styled from "@emotion/styled";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import Tag from "@reearth-cms/components/atoms/Tag";
import { Field } from "@reearth-cms/components/molecules/Schema/types";

import FieldTitle from "../../FieldTitle";

interface TagFieldProps {
  field: Field;
  handleBlurUpdate?: () => void;
}

const TagField: React.FC<TagFieldProps> = ({ field, handleBlurUpdate }) => {
  return (
    <Form.Item
      extra={field.description}
      name={field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
      {field.multiple ? (
        <StyledMultipleSelect
          onBlur={handleBlurUpdate}
          mode="multiple"
          showArrow
          style={{ width: "100%" }}>
          {field.typeProperty?.tags?.map((tag: { id: string; name: string; color: string }) => (
            <Select.Option key={tag.name} value={tag.id}>
              <Tag color={tag.color.toLowerCase()}>{tag.name}</Tag>
            </Select.Option>
          ))}
        </StyledMultipleSelect>
      ) : (
        <Select onBlur={handleBlurUpdate} showArrow style={{ width: "100%" }} allowClear>
          {field.typeProperty?.tags?.map((tag: { id: string; name: string; color: string }) => (
            <Select.Option key={tag.name} value={tag.id}>
              <Tag color={tag.color.toLowerCase()}>{tag.name}</Tag>
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
};

export default TagField;

const StyledMultipleSelect = styled(Select)`
  .ant-select-selection-overflow-item {
    margin-right: 4px;
  }
  .ant-select-selection-item {
    padding: 0;
    margin-right: 0;
    border: 0;
  }
  .ant-select-selection-item-content {
    margin-right: 0;
  }
  .ant-select-selection-item-remove {
    display: none;
  }
  .ant-tag {
    margin-right: 0;
  }
`;
