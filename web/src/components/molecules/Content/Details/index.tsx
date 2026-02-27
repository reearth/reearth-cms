import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import ContentForm from "@reearth-cms/components/molecules/Content/Form";
import {
  FormItem,
  FormValues,
  Item,
  ItemField,
  VersionedItem,
} from "@reearth-cms/components/molecules/Content/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import {
  Request,
  RequestItem,
  RequestState,
} from "@reearth-cms/components/molecules/Request/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";

type Props = {
  addItemToRequestModalShown: boolean;
  assetList: Asset[];
  collapsed: boolean;
  commentsPanel?: JSX.Element;
  fileList: UploadFile[];
  hasItemUpdateRight: boolean;
  hasPublishRight: boolean;
  hasRequestCreateRight: boolean;
  hasRequestUpdateRight: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFormValues: Record<string, any>;
  initialMetaFormValues: Record<string, unknown>;
  item?: Item;
  itemId?: string;
  itemLoading: boolean;
  linkedItemsModalList?: FormItem[];
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  linkItemModalTitle: string;
  linkItemModalTotalCount: number;
  loading: boolean;
  loadingAssets: boolean;
  loadingReference: boolean;
  model?: Model;
  modelsMenu: React.ReactNode;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetSearchTerm: (term?: string) => void;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onBack: () => void;
  onChange: (request: Request, items: RequestItem[]) => Promise<void>;
  onCheckItemReference: (
    itemId: string,
    correspondingFieldId: string,
    groupId?: string,
  ) => Promise<boolean>;
  onCollapse: (collapse: boolean) => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGetVersionedItem: (version: string) => Promise<FormValues>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  onItemCreate: (data: {
    fields: ItemField[];
    metaFields: ItemField[];
    metaSchemaId?: string;
    schemaId: string;
  }) => Promise<void>;
  onItemUpdate: (data: { fields: ItemField[]; itemId: string; }) => Promise<void>;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onLinkItemTableReload: () => void;
  onMetaItemUpdate: (data: { metaFields: ItemField[]; metaItemId?: string; }) => Promise<void>;
  onModalClose: () => void;
  onModalOpen: () => void;
  onNavigateToRequest: (id: string) => void;
  onPublish: (itemIds: string[]) => Promise<void>;
  onReferenceModelUpdate: (modelId: string, referenceFieldId: string) => void;
  onRequestCreate: (data: {
    description: string;
    items: RequestItem[];
    reviewersId: string[];
    state: RequestState;
    title: string;
  }) => Promise<void>;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onRequestTableReload: () => void;
  onSearchTerm: (term?: string) => void;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  onUploadModalCancel: () => void;
  page: number;
  pageSize: number;
  publishLoading: boolean;
  requestCreationLoading: boolean;
  requestModalLoading: boolean;
  requestModalPage: number;
  requestModalPageSize: number;
  requestModalShown: boolean;
  requestModalTotalCount: number;
  requests: Request[];
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  setUploadType: (type: UploadType) => void;
  setUploadUrl: (uploadUrl: { autoUnzip: boolean; url: string; }) => void;
  showPublishAction: boolean;
  title: string;
  totalCount: number;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadType: UploadType;
  uploadUrl: { autoUnzip: boolean; url: string; };
  versions: VersionedItem[];
  workspaceUserMembers: UserMember[];
};

const ContentDetailsMolecule: React.FC<Props> = ({
  addItemToRequestModalShown,
  assetList,
  collapsed,
  commentsPanel,
  fileList,
  hasItemUpdateRight,
  hasPublishRight,
  hasRequestCreateRight,
  hasRequestUpdateRight,
  initialFormValues,
  initialMetaFormValues,
  item,
  itemId,
  itemLoading,
  linkedItemsModalList,
  linkItemModalPage,
  linkItemModalPageSize,
  linkItemModalTitle,
  linkItemModalTotalCount,
  loading,
  loadingAssets,
  loadingReference,
  model,
  modelsMenu,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onAssetCreateFromUrl,
  onAssetsCreate,
  onAssetSearchTerm,
  onAssetsGet,
  onAssetsReload,
  onAssetTableChange,
  onBack,
  onChange,
  onCheckItemReference,
  onCollapse,
  onGetAsset,
  onGetVersionedItem,
  onGroupGet,
  onItemCreate,
  onItemUpdate,
  onLinkItemTableChange,
  onLinkItemTableReload,
  onMetaItemUpdate,
  onModalClose,
  onModalOpen,
  onNavigateToRequest,
  onPublish,
  onReferenceModelUpdate,
  onRequestCreate,
  onRequestSearchTerm,
  onRequestTableChange,
  onRequestTableReload,
  onSearchTerm,
  onUnpublish,
  onUploadModalCancel,
  page,
  pageSize,
  publishLoading,
  requestCreationLoading,
  requestModalLoading,
  requestModalPage,
  requestModalPageSize,
  requestModalShown,
  requestModalTotalCount,
  requests,
  setFileList,
  setUploadModalVisibility,
  setUploadType,
  setUploadUrl,
  showPublishAction,
  title,
  totalCount,
  uploading,
  uploadModalVisibility,
  uploadType,
  uploadUrl,
  versions,
  workspaceUserMembers,
}) => {
  return (
    <ComplexInnerContents
      center={
        itemId && !itemLoading && !item ? (
          <NotFound />
        ) : (
          <ContentForm
            addItemToRequestModalShown={addItemToRequestModalShown}
            assetList={assetList}
            fileList={fileList}
            hasItemUpdateRight={hasItemUpdateRight}
            hasPublishRight={hasPublishRight}
            hasRequestCreateRight={hasRequestCreateRight}
            hasRequestUpdateRight={hasRequestUpdateRight}
            initialFormValues={initialFormValues}
            initialMetaFormValues={initialMetaFormValues}
            item={item}
            itemId={itemId}
            linkedItemsModalList={linkedItemsModalList}
            linkItemModalPage={linkItemModalPage}
            linkItemModalPageSize={linkItemModalPageSize}
            linkItemModalTitle={linkItemModalTitle}
            linkItemModalTotalCount={linkItemModalTotalCount}
            loading={loading}
            loadingAssets={loadingAssets}
            loadingReference={loadingReference}
            model={model}
            onAddItemToRequestModalClose={onAddItemToRequestModalClose}
            onAddItemToRequestModalOpen={onAddItemToRequestModalOpen}
            onAssetCreateFromUrl={onAssetCreateFromUrl}
            onAssetsCreate={onAssetsCreate}
            onAssetSearchTerm={onAssetSearchTerm}
            onAssetsGet={onAssetsGet}
            onAssetsReload={onAssetsReload}
            onAssetTableChange={onAssetTableChange}
            onBack={onBack}
            onChange={onChange}
            onCheckItemReference={onCheckItemReference}
            onGetAsset={onGetAsset}
            onGetVersionedItem={onGetVersionedItem}
            onGroupGet={onGroupGet}
            onItemCreate={onItemCreate}
            onItemUpdate={onItemUpdate}
            onLinkItemTableChange={onLinkItemTableChange}
            onLinkItemTableReload={onLinkItemTableReload}
            onMetaItemUpdate={onMetaItemUpdate}
            onModalClose={onModalClose}
            onModalOpen={onModalOpen}
            onNavigateToRequest={onNavigateToRequest}
            onPublish={onPublish}
            onReferenceModelUpdate={onReferenceModelUpdate}
            onRequestCreate={onRequestCreate}
            onRequestSearchTerm={onRequestSearchTerm}
            onRequestTableChange={onRequestTableChange}
            onRequestTableReload={onRequestTableReload}
            onSearchTerm={onSearchTerm}
            onUnpublish={onUnpublish}
            onUploadModalCancel={onUploadModalCancel}
            page={page}
            pageSize={pageSize}
            publishLoading={publishLoading}
            requestCreationLoading={requestCreationLoading}
            requestModalLoading={requestModalLoading}
            requestModalPage={requestModalPage}
            requestModalPageSize={requestModalPageSize}
            requestModalShown={requestModalShown}
            requestModalTotalCount={requestModalTotalCount}
            requests={requests}
            setFileList={setFileList}
            setUploadModalVisibility={setUploadModalVisibility}
            setUploadType={setUploadType}
            setUploadUrl={setUploadUrl}
            showPublishAction={showPublishAction}
            title={title}
            totalCount={totalCount}
            uploading={uploading}
            uploadModalVisibility={uploadModalVisibility}
            uploadType={uploadType}
            uploadUrl={uploadUrl}
            versions={versions}
            workspaceUserMembers={workspaceUserMembers}
          />
        )
      }
      left={
        <Sidebar
          collapsed={collapsed}
          collapsedWidth={54}
          onCollapse={onCollapse}
          trigger={<Icon icon={collapsed ? "panelToggleRight" : "panelToggleLeft"} />}
          width={208}>
          {modelsMenu}
        </Sidebar>
      }
      right={commentsPanel}
    />
  );
};

export default ContentDetailsMolecule;
