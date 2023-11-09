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
