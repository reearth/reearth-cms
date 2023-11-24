import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Popover from "@reearth-cms/components/atoms/Popover";
import Tag from "@reearth-cms/components/atoms/Tag";
import { fieldTypes } from "@reearth-cms/components/molecules/Schema/fieldTypes";
import { dateTimeFormat } from "@reearth-cms/utils/format";

export const renderTags = (el: any, field: any) => {
  const value = el.props.children as string;
  if (value === "-") return <span>-</span>;

  type Tag = { id: string; name: string; color: string };
  const tags: Tag[] | undefined = field.typeProperty?.tags;
  const tagIds: Set<string> = new Set(value.split(", "));
  const filteredTags: Tag[] = tags?.filter((tag: Tag) => tagIds.has(tag.id)) || [];
  return (
    <>
      {filteredTags.map(({ id, name, color }: Tag) => (
        <Tag key={id} color={color.toLowerCase()}>
          {name}
        </Tag>
      ))}
    </>
  );
};

export const renderField = (el: any, field: any) => {
  const value = el.props.children as string;
  if (value === "-") return <span>-</span>;

  const itemFormat = (item: string) => {
    switch (field.type) {
      case "Date":
        return dateTimeFormat(item);
      case "Bool":
        return item.charAt(0).toUpperCase() + item.slice(1);
      case "Asset":
        return (
          <AssetValue>
            <Icon icon={fieldTypes.Asset.icon} size={18} />
            {item}
          </AssetValue>
        );
      case "Reference":
        return (
          <StyledTag icon={<StyledIcon icon={fieldTypes.Reference.icon} size={14} />}>
            {item}
          </StyledTag>
        );
      default:
        return item;
    }
  };

  const items = value.split(", ");
  const content = (
    <>
      {items.map((item, index) => {
        return <p key={index}>{itemFormat(item)}</p>;
      })}
    </>
  );

  if (field.type === "Select") {
    return (
      <>
        {items.map((item, index) => (
          <Tag key={index}>{item}</Tag>
        ))}
      </>
    );
  } else if (items.length === 1) {
    switch (field.type) {
      case "TextArea":
      case "MarkdownText":
        return (
          <Popover content={content} title={field.title} trigger="focus" placement="bottom">
            <StyledButton>
              <Icon icon={fieldTypes[field.type].icon} size={16} />
            </StyledButton>
          </Popover>
        );
      default:
        return itemFormat(value);
    }
  } else {
    switch (field.type) {
      default:
        return (
          <Popover content={content} title={field.title} trigger="focus" placement="bottom">
            <StyledButton>
              <Icon icon={fieldTypes[field.type].icon} size={16} />
              <span>x{items.length}</span>
            </StyledButton>
          </Popover>
        );
    }
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
