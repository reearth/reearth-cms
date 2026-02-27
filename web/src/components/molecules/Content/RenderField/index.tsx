import styled from "@emotion/styled";

import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Popover from "@reearth-cms/components/atoms/Popover";
import Select from "@reearth-cms/components/atoms/Select";
import Tag from "@reearth-cms/components/atoms/Tag";
import { fieldTypes } from "@reearth-cms/components/molecules/Schema/fieldTypes";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import ItemFormat from "./ItemFormat";

export const renderField = (
  el: { props: { children: string | string[] } },
  field: Field,
  update?: (value?: boolean | string | string[], index?: number) => void,
) => {
  const value = el.props.children;
  const items = Array.isArray(value) ? value : [value];

  if ((field.type === "Bool" || field.type === "Checkbox") && !field.multiple) {
    return <ItemFormat field={field} item={items[0]} update={update} />;
  } else if (field.type === "Tag") {
    const tags = field.typeProperty?.tags;
    const filteredTags = tags?.filter(tag => value.includes(tag.id)) || [];
    return (
      <StyledSelect
        allowClear={field.multiple ? false : true}
        defaultValue={filteredTags.map(({ name }) => name)}
        disabled={!update}
        mode={field.multiple ? "multiple" : undefined}
        onChange={(_, option) => {
          const value: string | string[] | undefined = Array.isArray(option)
            ? option.map(({ key }) => key)
            : option?.key;
          update?.(value);
        }}
        placeholder="-"
        suffixIcon={null}
        tagRender={props => <>{props.label}</>}>
        {tags?.map(({ color, id, name }) => (
          <Select.Option key={id} value={name}>
            <Tag color={color.toLowerCase()}>{name}</Tag>
          </Select.Option>
        ))}
      </StyledSelect>
    );
  } else if (value === "-") {
    if ((field.type === "Text" || field.type === "Date" || field.type === "URL") && update) {
      return <ItemFormat field={field} item="" update={update} />;
    }
    return <span>-</span>;
  } else if (field.type === "Select") {
    return (
      <>
        {items.map((item, index) => (
          <Tag key={index}>{item}</Tag>
        ))}
      </>
    );
  } else if (
    items.length > 1 ||
    field.type === "TextArea" ||
    field.type === "MarkdownText" ||
    field.type === "GeometryObject" ||
    field.type === "GeometryEditor"
  ) {
    const content = (
      <>
        {items.map((item, index) => {
          return (
            <Content key={index}>
              <ItemFormat field={field} index={index} item={item} update={update} />
            </Content>
          );
        })}
      </>
    );
    return (
      <Popover
        content={
          <div data-testid={DATA_TEST_ID.Content__List__ItemFieldPopoverContent}>{content}</div>
        }
        placement="bottom"
        rootClassName="contentPopover"
        title={field.title}
        trigger="click">
        <StyledButton data-testid={DATA_TEST_ID.Content__List__ItemFieldPopoverIcon}>
          <Icon icon={fieldTypes[field.type].icon} size={16} />
          {items.length > 1 && <span>x{items.length}</span>}
        </StyledButton>
      </Popover>
    );
  } else {
    return <ItemFormat field={field} item={items[0]} update={update} />;
  }
};

const StyledButton = styled(Button)`
  align-items: center;
  border-color: #00000008;
  color: #1890ff;
  display: flex;
  font-size: 12px;
  gap: 8px;
  padding: 4px;
`;

const Content = styled.p`
  margin: 0;
  padding: 4px 8px 20px;
  :last-child {
    padding-bottom: 0;
  }
`;

const StyledSelect = styled(Select)`
  width: 100%;
  && .ant-select-selector {
    border-color: transparent;
    cursor: pointer !important;
  }
  .ant-select-selection-overflow {
    flex-wrap: nowrap;
    overflow: hidden;
  }
  .ant-select-selection-placeholder {
    color: inherit;
  }
`;
