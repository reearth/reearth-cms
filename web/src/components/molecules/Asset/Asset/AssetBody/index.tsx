import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { DefaultOptionType } from "@reearth-cms/components/atoms/Select";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import AssetMolecule from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/Asset";
import { PreviewType } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewTypeSelect";
import { ViewerType } from "@reearth-cms/components/organisms/Asset/Asset/hooks";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  asset?: Asset;
  selectedPreviewType: PreviewType;
  isModalVisible: boolean;
  viewerType: ViewerType;
  displayUnzipFileList: boolean;
  commentsPanel?: JSX.Element;
  onTypeChange: (
    value: PreviewType,
    option: DefaultOptionType | DefaultOptionType[],
  ) => void | undefined;
  onModalCancel: () => void;
  onChangeToFullScreen: () => void;
  onBack: () => void;
  onSave: () => void;
};

const AssetWrapper: React.FC<Props> = ({
  asset,
  selectedPreviewType,
  isModalVisible,
  viewerType,
  displayUnzipFileList,
  commentsPanel,
  onTypeChange,
  onModalCancel,
  onChangeToFullScreen,
  onBack,
  onSave,
}) => {
  const t = useT();

  return asset ? (
    <ComplexInnerContents
      center={
        <Wrapper>
          <PageHeader
            title={`${t("Asset")}/${asset?.fileName}`}
            extra={<Button onClick={onSave}>{t("Save")}</Button>}
            onBack={onBack}
          />
          <AssetMolecule
            asset={asset}
            selectedPreviewType={selectedPreviewType}
            isModalVisible={isModalVisible}
            viewerType={viewerType}
            displayUnzipFileList={displayUnzipFileList}
            onTypeChange={onTypeChange}
            onModalCancel={onModalCancel}
            onChangeToFullScreen={onChangeToFullScreen}
          />
        </Wrapper>
      }
      right={commentsPanel}
    />
  ) : (
    <Wrapper>not found</Wrapper>
  );
};

export default AssetWrapper;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
`;
