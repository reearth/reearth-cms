import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Popover from "@reearth-cms/components/atoms/Popover";
import Tag from "@reearth-cms/components/atoms/Tag";

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

export const renderMultiple = (el: any, field: any) => {
  const value = el.props.children as string;
  if (value === "-") return <span>-</span>;
  const items = value.split(", ");
  const content = (
    <>
      {items.map((item, index) => {
        return <p key={index}>{item}</p>;
      })}
    </>
  );

  return (
    <>
      {items.length === 1 ? (
        value
      ) : (
        <Popover content={content} title={field.title} trigger="focus" placement="bottom">
          <StyledButton>
            <Icon icon={"textT"} size={16} />
            <span>x{items.length}</span>
          </StyledButton>
        </Popover>
      )}
    </>
  );
};

const StyledButton = styled(Button)`
  align-items: center;
  color: #1890ff;
  display: flex;
  font-size: 12px;
  gap: 8px;
  padding: 4px;
`;
