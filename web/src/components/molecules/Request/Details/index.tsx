import RequestMolecule from "@reearth-cms//components/molecules/Request/Details/Request";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";

export type Props = {
  me?: User;
  currentRequest?: Request;
  workspaceUserMembers: Member[];
  onRequestApprove: (requestId: string) => Promise<void>;
  onRequestUpdate: (data: RequestUpdatePayload) => Promise<void>;
  onRequestDelete: (requestsId: string[]) => Promise<void>;
  onCommentCreate: (content: string) => Promise<void>;
  onBack: () => void;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: string;
  uploadType: UploadType;
  onUploadModalCancel: () => void;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onNavigateToAsset: (asset: Asset) => void;
};

const RequestDetailsMolecule: React.FC<Props> = ({
  me,
  currentRequest,
  workspaceUserMembers,
  onRequestApprove,
  onRequestUpdate,
  onRequestDelete,
  onCommentCreate,
  onBack,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onNavigateToAsset,
}) => {
  return currentRequest ? (
    <RequestMolecule
      me={me}
      currentRequest={currentRequest}
      workspaceUserMembers={workspaceUserMembers}
      onRequestApprove={onRequestApprove}
      onRequestUpdate={onRequestUpdate}
      onRequestDelete={onRequestDelete}
      onCommentCreate={onCommentCreate}
      onBack={onBack}
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
      onAssetsCreate={onAssetsCreate}
      onAssetCreateFromUrl={onAssetCreateFromUrl}
      onAssetsReload={onAssetsReload}
      onAssetSearchTerm={onAssetSearchTerm}
      setFileList={setFileList}
      setUploadModalVisibility={setUploadModalVisibility}
      onNavigateToAsset={onNavigateToAsset}
    />
  ) : null;
};
export default RequestDetailsMolecule;
