import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { DefaultOptionType } from "@reearth-cms/components/atoms/Select";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import AssetBody from "@reearth-cms/components/molecules/Asset/Asset/AssetBody";
import {
  PreviewType,
  PreviewTypeSelect,
} from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewTypeSelect";
import SideBarCard from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/sideBarCard";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

export type Props = {
  asset?: Asset;
  selectedPreviewType: PreviewType;
  isModalVisible: boolean;
  commentsSider?: JSX.Element;
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
  commentsSider,
  handleTypeChange,
  handleModalCancel,
  handleFullScreen,
  onBack,
  onSave,
}) => {
  const t = useT();
  const formattedCreatedAt = dateTimeFormat(asset?.createdAt);

  return asset ? (
    <ComplexInnerContents
      left={
        <Wrapper>
          <PageHeader
            title={`${t("Asset")}/${asset?.fileName}`}
            onBack={onBack}
            extra={<Button onClick={onSave}>{t("Save")}</Button>}
          />
          <AssetBody
            asset={asset}
            selectedPreviewType={selectedPreviewType}
            handleTypeChange={handleTypeChange}
            isModalVisible={isModalVisible}
            handleModalCancel={handleModalCancel}
            handleFullScreen={handleFullScreen}
          />
        </Wrapper>
      }
      center={
        <SideBarWrapper>
          <SideBarCard title={t("Asset Type")}>
            <PreviewTypeSelect
              style={{ width: "75%" }}
              value={selectedPreviewType}
              onTypeChange={handleTypeChange}
            />
          </SideBarCard>
          <SideBarCard title={t("Created Time")}>{formattedCreatedAt}</SideBarCard>
          <SideBarCard title={t("Created By")}>{asset.createdBy}</SideBarCard>
        </SideBarWrapper>
      }
      right={commentsSider}
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

const SideBarWrapper = styled.div`
  height: 100%;
  width: 272px;
  padding: 12px;
  overflow-y: auto;
  background-color: #fff;
`;

export default AssetWrapper;
