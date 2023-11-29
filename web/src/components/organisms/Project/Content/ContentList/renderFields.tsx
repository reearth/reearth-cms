import styled from "@emotion/styled";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Icon from "@reearth-cms/components/atoms/Icon";
import Popover from "@reearth-cms/components/atoms/Popover";
import Switch from "@reearth-cms/components/atoms/Switch";
import Tag from "@reearth-cms/components/atoms/Tag";
import { fieldTypes } from "@reearth-cms/components/molecules/Schema/fieldTypes";
import type { Field, FieldType } from "@reearth-cms/components/molecules/Schema/types";
import { dateTimeFormat } from "@reearth-cms/utils/format";

const itemFormat = (item: string, type: FieldType) => {
  switch (type) {
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
      return dateTimeFormat(item);
    case "Bool":
      return (
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
      return <Checkbox checked={item === "true"} />;
    default:
      return item;
  }
};

export const renderField = (el: { props: { children: string | string[] } }, field: Field) => {
  const value = el.props.children;
  const items = Array.isArray(value) ? value : [value];

  if (value === "-") {
    return <span>-</span>;
  } else if (field.type === "Tag") {
    const tags = field.typeProperty?.tags;
    const filteredTags = tags?.filter(tag => value.includes(tag.id)) || [];
    return (
      <>
        {filteredTags.map(({ id, name, color }) => (
          <Tag key={id} color={color.toLowerCase()}>
            {name}
          </Tag>
        ))}
      </>
    );
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
          return <Content key={index}>{itemFormat(item, field.type)}</Content>;
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
    return itemFormat(items[0], field.type);
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
