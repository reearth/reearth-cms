import Icon from "@reearth-cms/components/atoms/Icon";
import Space from "@reearth-cms/components/atoms/Space";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { AntdToken } from "@reearth-cms/utils/style";

export const renderTitle = (field: Field) => {
  return (
    <Space size={AntdToken.SPACING.XXS}>
      {field.title}
      <Icon icon="edit" />
    </Space>
  );
};
