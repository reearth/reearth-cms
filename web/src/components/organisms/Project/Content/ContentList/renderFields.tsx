import styled from "@emotion/styled";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Popover from "@reearth-cms/components/atoms/Popover";
import Select from "@reearth-cms/components/atoms/Select";
import Switch from "@reearth-cms/components/atoms/Switch";
import Tag from "@reearth-cms/components/atoms/Tag";
import { fieldTypes } from "@reearth-cms/components/molecules/Schema/fieldTypes";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";
import { dateTimeFormat, transformMomentToString } from "@reearth-cms/utils/format";

const itemFormat = (
  item: string,
  field: Field,
  update?: (value: string | boolean, index?: number) => void,
  index?: number,
) => {
  switch (field.type) {
    case "Text":
      return update ? (
        <StyledInput
          defaultValue={item}
          placeholder="-"
          onBlur={e => {
            update(e.target.value, index);
          }}
        />
      ) : (
        item
      );
    case "MarkdownText":
      return (
        <ReactMarkdown
          components={{
            a(props) {
              const { node: _, ...rest } = props;
              return <a target="_blank" {...rest} />;
            },
          }}
          remarkPlugins={[remarkGfm]}>
          {item}
        </ReactMarkdown>
      );
    case "Date":
      return update ? (
        <StyledDatePicker
          placeholder="-"
          defaultValue={item ? moment(item) : undefined}
          suffixIcon={undefined}
          onChange={date => {
            update(date ? transformMomentToString(date) : "", index);
          }}
        />
      ) : (
        dateTimeFormat(item)
      );
    case "Bool":
      return update ? (
        <Switch
          checkedChildren={<Icon icon={"check"} />}
          unCheckedChildren={<Icon icon={"close"} />}
          defaultChecked={item === "true"}
          onChange={checked => {
            update(checked, index);
          }}
        />
      ) : (
        <Switch
          checkedChildren={<Icon icon={"check"} />}
          unCheckedChildren={<Icon icon={"close"} />}
          checked={item === "true"}
        />
      );
    case "Asset":
      return (
        <AssetValue>
          <Icon icon={fieldTypes.Asset.icon} size={18} />
          {item}
        </AssetValue>
      );
    case "URL":
      return (
        <a href={item} target="_blank" rel="noreferrer">
          {item}
        </a>
      );
    case "Reference":
      return (
        <StyledTag icon={<StyledIcon icon={fieldTypes.Reference.icon} size={14} />}>
          {item}
        </StyledTag>
      );
    case "Checkbox":
      return update ? (
        <Checkbox
          defaultChecked={item === "true"}
          onChange={e => {
            update(e.target.checked, index);
          }}
        />
      ) : (
        <Checkbox checked={item === "true"} />
      );
    default:
      return item;
  }
};

export const renderField = (
  el: { props: { children: string | string[] } },
  field: Field,
  update?: (value?: string | string[] | boolean, index?: number) => void,
) => {
  const value = el.props.children;
  const items = Array.isArray(value) ? value : [value];

  if ((field.type === "Bool" || field.type === "Checkbox") && !field.multiple) {
    return itemFormat(items[0], field, update);
  } else if (field.type === "Tag") {
    const tags = field.typeProperty?.tags;
    const filteredTags = tags?.filter(tag => value.includes(tag.id)) || [];
    return (
      <StyledSelect
        mode={field.multiple ? "multiple" : undefined}
        defaultValue={filteredTags.map(({ name }) => name)}
        tagRender={props => {
          return <>{props.label}</>;
        }}
        showArrow={false}
        allowClear={field.multiple ? false : true}
        onChange={(_, option) => {
          const value: string | string[] | undefined = Array.isArray(option)
            ? option.map(({ key }) => key)
            : option?.key;
          update?.(value);
        }}
        placeholder="-">
        {tags?.map(({ id, name, color }) => (
          <Select.Option key={id} value={name}>
            <Tag color={color.toLowerCase()}>{name}</Tag>
          </Select.Option>
        ))}
      </StyledSelect>
    );
  } else if (value === "-") {
    if ((field.type === "Text" || field.type === "Date") && !field.multiple && update) {
      return itemFormat("", field, update);
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
  } else if (items.length > 1 || field.type === "TextArea" || field.type === "MarkdownText") {
    const content = (
      <>
        {items.map((item, index) => {
          return <Content key={index}>{itemFormat(item, field, update, index)}</Content>;
        })}
      </>
    );
    return (
      <Popover content={content} title={field.title} trigger="click" placement="bottom">
        <StyledButton>
          <Icon icon={fieldTypes[field.type].icon} size={16} />
          {items.length > 1 && <span>x{items.length}</span>}
        </StyledButton>
      </Popover>
    );
  } else {
    return itemFormat(items[0], field, update);
  }
};

const AssetValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledTag = styled(Tag)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const StyledIcon = styled(Icon)`
  height: 14px;
`;

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

const StyledInput = styled(Input)`
  border-color: transparent;
  cursor: pointer;
  padding-left: 0;
  padding-right: 0;
  input {
    cursor: pointer;
  }
  :hover {
    border-color: transparent;
  }
  :focus {
    cursor: text;
    border-color: #40a9ff;
    ::placeholder {
      color: transparent;
    }
  }
  ::placeholder {
    color: inherit;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  border-color: transparent;
  cursor: pointer;
  padding-left: 0;
  padding-right: 0;
  input {
    cursor: pointer;
    :focus {
      cursor: text;
      ::placeholder {
        color: transparent;
      }
    }
    ::placeholder {
      color: inherit;
    }
  }
  :hover {
    border-color: transparent;
  }
  &.ant-picker-focused {
    border-color: #40a9ff;
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
    overflow-x: hidden;
  }
  .ant-select-selection-placeholder {
    color: inherit;
  }
`;
