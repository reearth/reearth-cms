import styled from "@emotion/styled";
import { Viewer as CesiumViewer } from "cesium";

import Button from "@reearth-cms/components/atoms/Button";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import AssetMolecule from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/Asset";
import { PreviewType } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewTypeSelect";
import { Asset, AssetItem, ViewerType } from "@reearth-cms/components/molecules/Asset/types";
import CommentsPanelWrapper, {
  CommentProps,
} from "@reearth-cms/components/molecules/Common/CommentsPanel";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  userId: string;
  asset: Asset;
  assetFileExt?: string;
  selectedPreviewType: PreviewType;
  isModalVisible: boolean;
  viewerType: ViewerType;
  displayUnzipFileList: boolean;
  decompressing: boolean;
  isSaveDisabled: boolean;
  updateLoading: boolean;
  hasUpdateRight: boolean;
  onAssetItemSelect: (item: AssetItem) => void;
  onAssetDecompress: (assetId: string) => void;
  onTypeChange: (value: PreviewType) => void;
  onModalCancel: () => void;
  onChangeToFullScreen: () => void;
  onBack: () => void;
  onSave: () => void;
  onGetViewer: (viewer?: CesiumViewer) => void;
  workspaceSettings: WorkspaceSettings;
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
  commentProps: CommentProps;
};

const AssetWrapper: React.FC<Props> = ({
  userId,
  asset,
  assetFileExt,
  selectedPreviewType,
  isModalVisible,
  viewerType,
  displayUnzipFileList,
  decompressing,
  isSaveDisabled,
  updateLoading,
  hasUpdateRight,
  onAssetItemSelect,
  onAssetDecompress,
  onTypeChange,
  onModalCancel,
  onChangeToFullScreen,
  onBack,
  onSave,
  onGetViewer,
  workspaceSettings,
  collapsed,
  onCollapse,
  commentProps,
}) => {
  const t = useT();

  return (
    <ComplexInnerContents
      center={
        <Wrapper>
          <PageHeader
            title={`${t("Asset")} / ${asset?.fileName}`}
            extra={
              <Button onClick={onSave} disabled={isSaveDisabled} loading={updateLoading}>
                {t("Save")}
              </Button>
            }
            onBack={onBack}
          />
          <AssetMolecule
            asset={asset}
            assetFileExt={assetFileExt}
            selectedPreviewType={selectedPreviewType}
            isModalVisible={isModalVisible}
            viewerType={viewerType}
            displayUnzipFileList={displayUnzipFileList}
            decompressing={decompressing}
            hasUpdateRight={hasUpdateRight}
            onAssetDecompress={onAssetDecompress}
            onAssetItemSelect={onAssetItemSelect}
            onTypeChange={onTypeChange}
            onModalCancel={onModalCancel}
            onChangeToFullScreen={onChangeToFullScreen}
            onGetViewer={onGetViewer}
            workspaceSettings={workspaceSettings}
          />
        </Wrapper>
      }
      right={
        <CommentsPanelWrapper
          userId={userId}
          resourceId={asset.id}
          collapsed={collapsed}
          onCollapse={onCollapse}
          comments={asset.comments}
          threadId={asset.threadId}
          {...commentProps}
        />
      }
    />
  );
};

export default AssetWrapper;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
`;
