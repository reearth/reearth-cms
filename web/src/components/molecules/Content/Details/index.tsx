import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import ContentForm from "@reearth-cms/components/molecules/Content/Form";
import { ItemField } from "@reearth-cms/components/molecules/Content/types";
import { RequestState } from "@reearth-cms/components/molecules/Request/types";
import { Model } from "@reearth-cms/components/molecules/Schema/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";

export type Props = {
  collapsed?: boolean;
  model?: Model;
  modelsMenu: React.ReactNode;
  initialFormValues: { [key: string]: any };
  itemId?: string;
  loading: boolean;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: string;
  uploadType: UploadType;
  commentsPanel?: JSX.Element;
  requestModalShown: boolean;
  workspaceUserMembers: Member[];
  onCollapse?: (collapse: boolean) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onItemCreate: (data: { schemaId: string; fields: ItemField[] }) => Promise<void>;
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>;
  onBack: (modelId?: string) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onNavigateToAsset: (asset: Asset) => void;
  onRequestCreate: (data: {
    title: string;
    description: string;
    state: RequestState;
    reviewersId: string[];
    items: {
      itemId: string;
    }[];
  }) => Promise<void>;
  onModalClose: () => void;
  onModalOpen: () => void;
};

const ContentDetailsMolecule: React.FC<Props> = ({
  collapsed,
  model,
  modelsMenu,
  initialFormValues,
  itemId,
  loading,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  commentsPanel,
  requestModalShown,
  workspaceUserMembers,
  onCollapse,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onItemCreate,
  onItemUpdate,
  onBack,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onNavigateToAsset,
  onRequestCreate,
  onModalClose,
  onModalOpen,
}) => {
  return (
    <ComplexInnerContents
      left={
        <Sidebar
          collapsed={collapsed}
          onCollapse={onCollapse}
          collapsedWidth={54}
          width={208}
          trigger={<Icon icon={collapsed ? "panelToggleRight" : "panelToggleLeft"} />}>
          {modelsMenu}
        </Sidebar>
      }
      center={
        <ContentForm
          loading={loading}
          itemId={itemId}
          model={model}
          initialFormValues={initialFormValues}
          assetList={assetList}
          fileList={fileList}
          loadingAssets={loadingAssets}
          uploading={uploading}
          uploadModalVisibility={uploadModalVisibility}
          uploadUrl={uploadUrl}
          uploadType={uploadType}
          onUploadModalCancel={onUploadModalCancel}
          setUploadUrl={setUploadUrl}
          setUploadType={setUploadType}
          onBack={onBack}
          onItemCreate={onItemCreate}
          onItemUpdate={onItemUpdate}
          onAssetsCreate={onAssetsCreate}
          onAssetCreateFromUrl={onAssetCreateFromUrl}
          onAssetsReload={onAssetsReload}
          onAssetSearchTerm={onAssetSearchTerm}
          setFileList={setFileList}
          setUploadModalVisibility={setUploadModalVisibility}
          onNavigateToAsset={onNavigateToAsset}
          requestModalShown={requestModalShown}
          onRequestCreate={onRequestCreate}
          onModalClose={onModalClose}
          onModalOpen={onModalOpen}
          workspaceUserMembers={workspaceUserMembers}
        />
      }
      right={commentsPanel}
    />
  );
};

export default ContentDetailsMolecule;
