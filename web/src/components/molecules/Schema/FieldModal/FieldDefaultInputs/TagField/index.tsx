import styled from "@emotion/styled";
import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import Tag from "@reearth-cms/components/atoms/Tag";
import { useT } from "@reearth-cms/i18n";

type Props = {
  multiple: boolean;
  selectedTags?: { color: string; id: string; name: string; }[];
};

const TagField: React.FC<Props> = ({ multiple, selectedTags }) => {
  const t = useT();

  return (
    <Form.Item label={t("Set default value")} name="defaultValue">
      {multiple ? (
        <StyledMultipleSelect
          key={selectedTags?.length}
          mode="multiple"
          tagRender={props => <>{props.label}</>}>
          {selectedTags?.map(tag => (
            <Select.Option key={tag.name} value={tag.name}>
              <Tag color={tag.color.toLowerCase()}>{tag.name}</Tag>
            </Select.Option>
          ))}
        </StyledMultipleSelect>
      ) : (
        <Select allowClear key={selectedTags?.length}>
          {selectedTags?.map(tag => (
            <Select.Option key={tag.name} value={tag.name}>
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

export default TagField;
