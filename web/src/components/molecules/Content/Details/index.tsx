import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import CommentsPanelWrapper, {
  CommentProps,
} from "@reearth-cms/components/molecules/Common/CommentsPanel";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import ContentForm from "@reearth-cms/components/molecules/Content/Form";
import {
  Item,
  FormItem,
  ItemField,
  VersionedItem,
  FormValues,
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
  userId: string;
  hasRequestCreateRight: boolean;
  hasRequestUpdateRight: boolean;
  hasPublishRight: boolean;
  hasItemUpdateRight: boolean;
  loadingReference: boolean;
  linkedItemsModalList?: FormItem[];
  showPublishAction: boolean;
  requests: Request[];
  collapsed: boolean;
  model?: Model;
  modelsMenu: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFormValues: Record<string, any>;
  initialMetaFormValues: Record<string, unknown>;
  versions: VersionedItem[];
  title: string;
  item?: Item;
  itemId?: string;
  itemLoading: boolean;
  loading: boolean;
  requestCreationLoading: boolean;
  assets: Asset[];
  loadingAssets: boolean;
  requestModalShown: boolean;
  addItemToRequestModalShown: boolean;
  workspaceUserMembers: UserMember[];
  totalCount: number;
  page: number;
  pageSize: number;
  publishLoading: boolean;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  linkItemModalTitle: string;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onReferenceModelUpdate: (modelId: string, referenceFieldId: string) => void;
  onSearchTerm: (term?: string) => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onGetVersionedItem: (version: string) => Promise<FormValues>;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  onPublish: (itemIds: string[]) => Promise<void>;
  onLinkItemTableReload: () => void;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onCollapse: (collapse: boolean) => void;
  onItemCreate: (data: {
    schemaId: string;
    metaSchemaId?: string;
    fields: ItemField[];
    metaFields: ItemField[];
  }) => Promise<void>;
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>;
  onMetaItemUpdate: (data: { metaItemId?: string; metaFields: ItemField[] }) => Promise<void>;
  onBack: () => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term: string) => void;
  onRequestCreate: (data: {
    title: string;
    description: string;
    state: RequestState;
    reviewersId: string[];
    items: RequestItem[];
  }) => Promise<void>;
  onChange: (request: Request, items: RequestItem[]) => Promise<void>;
  onModalClose: () => void;
  onModalOpen: () => void;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
  onAssetGet: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  onCheckItemReference: (
    itemId: string,
    correspondingFieldId: string,
    groupId?: string,
  ) => Promise<boolean>;
  onNavigateToRequest: (id: string) => void;
  commentCollapsed: boolean;
  onCollapseComment: (value: boolean) => void;
  commentProps: CommentProps;
};

const ContentDetailsMolecule: React.FC<Props> = ({
  userId,
  hasRequestCreateRight,
  hasRequestUpdateRight,
  hasPublishRight,
  hasItemUpdateRight,
  loadingReference,
  linkedItemsModalList,
  showPublishAction,
  requests,
  collapsed,
  model,
  modelsMenu,
  initialFormValues,
  initialMetaFormValues,
  versions,
  title,
  item,
  itemId,
  itemLoading,
  loading,
  requestCreationLoading,
  assets,
  loadingAssets,
  requestModalShown,
  addItemToRequestModalShown,
  workspaceUserMembers,
  totalCount,
  page,
  pageSize,
  onLinkItemTableReload,
  onRequestTableChange,
  onRequestSearchTerm,
  onRequestTableReload,
  publishLoading,
  requestModalLoading,
  requestModalTotalCount,
  requestModalPage,
  requestModalPageSize,
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onReferenceModelUpdate,
  onSearchTerm,
  onLinkItemTableChange,
  onGetVersionedItem,
  onPublish,
  onUnpublish,
  onCollapse,
  onItemCreate,
  onItemUpdate,
  onMetaItemUpdate,
  onBack,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsGet,
  onAssetsReload,
  onAssetSearchTerm,
  onRequestCreate,
  onChange,
  onModalClose,
  onModalOpen,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onAssetTableChange,
  onAssetGet,
  onGroupGet,
  onCheckItemReference,
  onNavigateToRequest,
  commentCollapsed,
  onCollapseComment,
  commentProps,
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
        itemId && !itemLoading && !item ? (
          <NotFound />
        ) : (
          <ContentForm
            title={title}
            item={item}
            hasRequestCreateRight={hasRequestCreateRight}
            hasRequestUpdateRight={hasRequestUpdateRight}
            hasPublishRight={hasPublishRight}
            hasItemUpdateRight={hasItemUpdateRight}
            linkItemModalTitle={linkItemModalTitle}
            linkItemModalTotalCount={linkItemModalTotalCount}
            linkItemModalPage={linkItemModalPage}
            linkItemModalPageSize={linkItemModalPageSize}
            onReferenceModelUpdate={onReferenceModelUpdate}
            onSearchTerm={onSearchTerm}
            onLinkItemTableChange={onLinkItemTableChange}
            loadingReference={loadingReference}
            linkedItemsModalList={linkedItemsModalList}
            showPublishAction={showPublishAction}
            requests={requests}
            requestCreationLoading={requestCreationLoading}
            onLinkItemTableReload={onLinkItemTableReload}
            onRequestTableChange={onRequestTableChange}
            onRequestSearchTerm={onRequestSearchTerm}
            onRequestTableReload={onRequestTableReload}
            publishLoading={publishLoading}
            requestModalLoading={requestModalLoading}
            requestModalTotalCount={requestModalTotalCount}
            requestModalPage={requestModalPage}
            requestModalPageSize={requestModalPageSize}
            loading={loading}
            itemId={itemId}
            model={model}
            initialFormValues={initialFormValues}
            initialMetaFormValues={initialMetaFormValues}
            versions={versions}
            assets={assets}
            onAssetTableChange={onAssetTableChange}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            loadingAssets={loadingAssets}
            onGetVersionedItem={onGetVersionedItem}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            onChange={onChange}
            onBack={onBack}
            onItemCreate={onItemCreate}
            onItemUpdate={onItemUpdate}
            onMetaItemUpdate={onMetaItemUpdate}
            onAssetsCreate={onAssetsCreate}
            onAssetCreateFromUrl={onAssetCreateFromUrl}
            onAssetsGet={onAssetsGet}
            onAssetsReload={onAssetsReload}
            onAssetSearchTerm={onAssetSearchTerm}
            requestModalShown={requestModalShown}
            addItemToRequestModalShown={addItemToRequestModalShown}
            onRequestCreate={onRequestCreate}
            onModalClose={onModalClose}
            onModalOpen={onModalOpen}
            onAddItemToRequestModalOpen={onAddItemToRequestModalOpen}
            onAddItemToRequestModalClose={onAddItemToRequestModalClose}
            workspaceUserMembers={workspaceUserMembers}
            onAssetGet={onAssetGet}
            onGroupGet={onGroupGet}
            onCheckItemReference={onCheckItemReference}
            onNavigateToRequest={onNavigateToRequest}
          />
        )
      }
      right={
        item && (
          <CommentsPanelWrapper
            userId={userId}
            resourceId={item.id}
            collapsed={commentCollapsed}
            onCollapse={onCollapseComment}
            comments={item.comments}
            threadId={item.threadId}
            {...commentProps}
          />
        )
      }
    />
  );
};

export default ContentDetailsMolecule;
