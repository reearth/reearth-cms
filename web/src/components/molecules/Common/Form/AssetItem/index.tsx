import styled from "@emotion/styled";
import { FormItemProps } from "antd/lib/form/FormItem";
import { FormItemLabelProps } from "antd/lib/form/FormItemLabel";
import React, { useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { useT } from "@reearth-cms/i18n";

import LinkToAssetModal from "../../LinkToAssetModal/linkToAssetModal";

type Props = {
  assetList: Asset[];
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsReload: () => void;
  loadingAssets: boolean;
} & FormItemProps &
  FormItemLabelProps;

const AssetItem: React.FC<Props> = ({
  name,
  label,
  extra,
  rules,
  assetList,
  onAssetSearchTerm,
  onAssetsReload,
  loadingAssets,
}) => {
  const t = useT();
  const { Item } = Form;

  const [visible, setVisible] = useState(false);
  const handleClick = () => {
    setVisible(true);
  };
  const handleCancel = () => {
    setVisible(false);
  };
  const handleConnect = (asset: any) => {
    console.log(asset);
  };

  return (
    <Item name={name} label={label} extra={extra} rules={rules}>
      <AssetButton onClick={handleClick}>
        <div>
          <Icon icon="link" />
          <div style={{ marginTop: 8 }}>{t("Asset")}</div>
        </div>
      </AssetButton>
      <LinkToAssetModal
        visible={visible}
        onCancel={handleCancel}
        assetList={assetList}
        onConnect={handleConnect}
        onSearchTerm={onAssetSearchTerm}
        onAssetsReload={onAssetsReload}
        loading={loadingAssets}
      />
    </Item>
  );
};

const AssetButton = styled(Button)`
  width: 100px;
  height: 100px;
`;

export default AssetItem;
