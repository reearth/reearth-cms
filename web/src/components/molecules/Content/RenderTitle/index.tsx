import Icon from "@reearth-cms/components/atoms/Icon";
import Space from "@reearth-cms/components/atoms/Space";
import { Field } from "@reearth-cms/components/molecules/Schema/types";

export const renderTitle = (field: Field) => {
  if (field.type === "URL") {
    return field.title;
  } else {
    return (
      <Space size={4}>
        {field.title}
        <Icon icon="edit" />
      </Space>
    );
  }
};
