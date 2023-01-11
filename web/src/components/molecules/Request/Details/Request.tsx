import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import RequestThread from "@reearth-cms/components/molecules/Request/Details/Thread";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

import RequestSidebarWrapper from "./SidebarWrapper";

type Props = {
  me?: User;
  isCloseActionEnabled: boolean;
  isApproveActionEnabled: boolean;
  currentRequest: Request;
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

const RequestMolecule: React.FC<Props> = ({
  me,
  isCloseActionEnabled,
  isApproveActionEnabled,
  currentRequest,
  workspaceUserMembers,
  onCommentCreate,
  onRequestApprove,
  onRequestUpdate,
  onRequestDelete,
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
  const t = useT();

  return (
    <Content>
      <PageHeader
        title={currentRequest.title}
        onBack={onBack}
        extra={
          <>
            <Button
              disabled={!isCloseActionEnabled}
              onClick={() => onRequestDelete([currentRequest.id])}>
              {t("Close")}
            </Button>
            <Button
              hidden={currentRequest.state !== "CLOSED"}
              onClick={() =>
                onRequestUpdate({
                  requestId: currentRequest.id,
                  title: currentRequest?.title,
                  description: currentRequest?.description,
                  reviewersId: currentRequest.reviewers.map(reviewer => reviewer.id),
                  state: "WAITING",
                })
              }>
              {t("Reopen")}
            </Button>
            <Button
              disabled={!isApproveActionEnabled}
              type="primary"
              onClick={() => onRequestApprove(currentRequest.id)}>
              {t("Approve")}
            </Button>
          </>
        }
      />
      <BodyWrapper>
        <ThreadWrapper>
          <RequestThread
            me={me}
            currentRequest={currentRequest}
            onCommentCreate={onCommentCreate}
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
        </ThreadWrapper>
        <RequestSidebarWrapper
          currentRequest={currentRequest}
          workspaceUserMembers={workspaceUserMembers}
          onRequestUpdate={onRequestUpdate}
        />
      </BodyWrapper>
    </Content>
  );
};

const Content = styled.div`
  padding: 16px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

const BodyWrapper = styled.div`
  padding: 24px;
  display: flex;
`;

const ThreadWrapper = styled.div`
  flex: 1;
`;

export default RequestMolecule;
