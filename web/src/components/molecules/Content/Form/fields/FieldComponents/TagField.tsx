import styled from "@emotion/styled";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import Tag from "@reearth-cms/components/atoms/Tag";
import { FieldProps } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";

const TagField: React.FC<FieldProps> = ({ field, disabled }) => {
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
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
      {field.multiple ? (
        <StyledMultipleSelect
          mode="multiple"
          tagRender={props => <>{props.label}</>}
          allowClear
          disabled={disabled}>
          {field.typeProperty?.tags?.map((tag: { id: string; name: string; color: string }) => (
            <Select.Option key={tag.name} value={tag.id}>
              <Tag color={tag.color.toLowerCase()}>{tag.name}</Tag>
            </Select.Option>
          ))}
        </StyledMultipleSelect>
      ) : (
        <Select allowClear disabled={disabled}>
          {field.typeProperty?.tags?.map((tag: { id: string; name: string; color: string }) => (
            <Select.Option key={tag.name} value={tag.id}>
              <TagWrapper>
                <Tag color={tag.color.toLowerCase()}>{tag.name}</Tag>
              </TagWrapper>
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
};

export default TagField;

const StyledMultipleSelect = styled(Select)`
  .ant-select-selection-overflow {
    overflow-x: auto;
    overflow-y: hidden;
  }
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

const TagWrapper = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
`;
