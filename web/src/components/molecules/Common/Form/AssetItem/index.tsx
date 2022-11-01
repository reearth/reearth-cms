import styled from "@emotion/styled";
import { FormItemProps } from "antd/lib/form/FormItem";
import { FormItemLabelProps } from "antd/lib/form/FormItemLabel";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import useHooks from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";

import LinkToAssetModal from "../../LinkToAssetModal/linkToAssetModal";

type Props = FormItemProps & FormItemLabelProps;

const AssetItem: React.FC<Props> = ({ name, label, extra, rules }) => {
  const t = useT();
  const { Item } = Form;

  const { projectId } = useParams();
  const { assetList, handleSearchTerm, handleAssetsReload, loading } = useHooks(projectId);

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
        onSearchTerm={handleSearchTerm}
        onAssetsReload={handleAssetsReload}
        loading={loading}
      />
    </Item>
  );
};

const AssetButton = styled(Button)`
  width: 100px;
  height: 100px;
`;

export default AssetItem;
