import styled from "@emotion/styled";

import AntDComment from "@reearth-cms/components/atoms/Comment";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { RequestCommentList } from "@reearth-cms/components/molecules/Request/Details/CommentList";
import { RequestDescription } from "@reearth-cms/components/molecules/Request/Details/RequestDescription";
import { Request } from "@reearth-cms/components/molecules/Request/types";

import RequestEditor from "./Editor";
import RequestStatus from "./RequestStatus";

export type Props = {
  me?: User;
  currentRequest: Request;
  emptyText?: string;
  onCommentCreate: (content: string) => Promise<void>;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
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

const RequestThread: React.FC<Props> = ({
  me,
  currentRequest,
  emptyText,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
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
  return (
    <ContentWrapper>
      <ThreadWrapper>
        <CommentsContainer>
          <RequestDescription
            currentRequest={currentRequest}
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
          {currentRequest.comments && currentRequest.comments?.length > 0 && (
            <RequestCommentList
              me={me}
              comments={currentRequest.comments}
              onCommentUpdate={onCommentUpdate}
              onCommentDelete={onCommentDelete}
            />
          )}
        </CommentsContainer>
        <StyledRequestStatus
          approvedAt={currentRequest.approvedAt}
          closedAt={currentRequest.closedAt}
        />
      </ThreadWrapper>

      {!currentRequest.comments || currentRequest.comments.length === 0 ? (
        <EmptyTextWrapper>{emptyText}</EmptyTextWrapper>
      ) : null}

      <ThreadDivider />

      <AntDComment
        avatar={<UserAvatar username={me?.name} />}
        content={<RequestEditor onCommentCreate={onCommentCreate} />}
      />
    </ContentWrapper>
  );
};

export default RequestThread;

const StyledRequestStatus = styled(RequestStatus)`
  display: inline-block;
`;

const ThreadWrapper = styled.div`
  padding: 0 12px;
  overflow: auto;
`;

const CommentsContainer = styled.div`
  overflow: auto;
`;

const EmptyTextWrapper = styled.div`
  padding: 12px;
  color: #00000073;
  text-align: center;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const ThreadDivider = styled.div`
  border-top: 1px solid #d9d9d9;
  width: calc(100% - 12px);
  padding: 0 12px;
`;
