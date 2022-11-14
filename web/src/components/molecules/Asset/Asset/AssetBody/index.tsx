import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { DefaultOptionType } from "@reearth-cms/components/atoms/Select";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import AssetMolecule from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/Asset";
import { PreviewType } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewTypeSelect";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  asset?: Asset;
  selectedPreviewType: PreviewType;
  isModalVisible: boolean;
  commentsPanel?: JSX.Element;
  handleTypeChange: (
    value: PreviewType,
    option: DefaultOptionType | DefaultOptionType[],
  ) => void | undefined;
  handleModalCancel: () => void;
  handleFullScreen: () => void;
  onBack: () => void;
  onSave: () => void;
};

const AssetWrapper: React.FC<Props> = ({
  asset,
  selectedPreviewType,
  isModalVisible,
  commentsPanel,
  handleTypeChange,
  handleModalCancel,
  handleFullScreen,
  onBack,
  onSave,
}) => {
  const t = useT();

  return asset ? (
    <ComplexInnerContents
      left={
        <Wrapper>
          <PageHeader
            title={`${t("Asset")}/${asset?.fileName}`}
            onBack={onBack}
            extra={<Button onClick={onSave}>{t("Save")}</Button>}
          />
          <AssetMolecule
            asset={asset}
            selectedPreviewType={selectedPreviewType}
            handleTypeChange={handleTypeChange}
            isModalVisible={isModalVisible}
            handleModalCancel={handleModalCancel}
            handleFullScreen={handleFullScreen}
          />
        </Wrapper>
      }
      right={commentsPanel}
    />
  ) : (
    <Wrapper>not found</Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: white;
  min-height: 100%;
`;
export default AssetWrapper;
