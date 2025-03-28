import Form from "@reearth-cms/components/atoms/Form";
import AssetItem, { AssetProps } from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import MultiValueAsset from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueAsset";
import { useT } from "@reearth-cms/i18n";

export type DefaultAssetProps = Required<Omit<AssetProps, "itemAssets">>;

type Props = {
  multiple: boolean;
} & DefaultAssetProps;

const AssetField: React.FC<Props> = ({ multiple, ...props }) => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      {multiple ? <MultiValueAsset {...props} /> : <AssetItem {...props} />}
    </Form.Item>
  );
};

export default AssetField;
