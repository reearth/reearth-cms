import styled from "@emotion/styled";
import { Viewer as CesiumViewer } from "cesium";
import { RefObject } from "react";
import { CesiumComponentRef } from "resium";

import Button from "@reearth-cms/components/atoms/Button";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import AssetMolecule from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/Asset";
import { PreviewType } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewTypeSelect";
import { Asset, AssetItem, ViewerType } from "@reearth-cms/components/molecules/Asset/types";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  asset: Asset;
  assetFileExt?: string;
  commentsPanel: JSX.Element;
  decompressing: boolean;
  displayUnzipFileList: boolean;
  hasUpdateRight: boolean;
  isModalVisible: boolean;
  isSaveDisabled: boolean;
  onAssetDecompress: (assetId: string) => void;
  onAssetDownload: (asset: Asset) => Promise<void>;
  onAssetItemSelect: (item: AssetItem) => void;
  onBack: () => void;
  onChangeToFullScreen: () => void;
  onModalCancel: () => void;
  onSave: () => void;
  onTypeChange: (value: PreviewType) => void;
  selectedPreviewType?: PreviewType;
  updateLoading: boolean;
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
  viewerType?: ViewerType;
  workspaceSettings: WorkspaceSettings;
};

const AssetWrapper: React.FC<Props> = ({
  asset,
  assetFileExt,
  commentsPanel,
  decompressing,
  displayUnzipFileList,
  hasUpdateRight,
  isModalVisible,
  isSaveDisabled,
  onAssetDecompress,
  onAssetDownload,
  onAssetItemSelect,
  onBack,
  onChangeToFullScreen,
  onModalCancel,
  onSave,
  onTypeChange,
  selectedPreviewType,
  updateLoading,
  viewerRef,
  viewerType,
  workspaceSettings,
}) => {
  const t = useT();

  return (
    <ComplexInnerContents
      center={
        <Wrapper>
          <PageHeader
            extra={
              <Button disabled={isSaveDisabled} loading={updateLoading} onClick={onSave}>
                {t("Save")}
              </Button>
            }
            onBack={onBack}
            title={`${t("Asset")} / ${asset?.fileName}`}
          />
          <AssetMolecule
            asset={asset}
            assetFileExt={assetFileExt}
            decompressing={decompressing}
            displayUnzipFileList={displayUnzipFileList}
            hasUpdateRight={hasUpdateRight}
            isModalVisible={isModalVisible}
            onAssetDecompress={onAssetDecompress}
            onAssetDownload={onAssetDownload}
            onAssetItemSelect={onAssetItemSelect}
            onChangeToFullScreen={onChangeToFullScreen}
            onModalCancel={onModalCancel}
            onTypeChange={onTypeChange}
            selectedPreviewType={selectedPreviewType}
            viewerRef={viewerRef}
            viewerType={viewerType}
            workspaceSettings={workspaceSettings}
          />
        </Wrapper>
      }
      right={commentsPanel}
    />
  );
};

export default AssetWrapper;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
`;
