import { FormItemProps } from "antd/lib/form/FormItem";
import { FormItemLabelProps } from "antd/lib/form/FormItemLabel";
import React from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";

// import LinkToAssetModal from "../../LinkToAssetModal/linkToAssetModal";

type Props = FormItemProps & FormItemLabelProps;

const AssetItem: React.FC<Props> = ({ name, label, extra, rules }) => {
  const t = useT();
  const { Item } = Form;

  const handleClick = () => { };

  return (
    <Item name={name} label={label} extra={extra} rules={rules}>
      <Button onClick={handleClick}>
        <div>
          <Icon icon="link" />
          <div style={{ marginTop: 8 }}>{t("Asset")}</div>
        </div>
      </Button>
      {/* <LinkToAssetModal /> */}
    </Item>
  );
};

export default AssetItem;
