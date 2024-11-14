import styled from "@emotion/styled";
import { Key } from "react";

import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ColumnsState } from "@reearth-cms/components/atoms/ProTable";
import RequestListTable from "@reearth-cms/components/molecules/Request/Table";
import { Request, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  commentsPanel: JSX.Element;
  requests: Request[];
  loading: boolean;
  selectedRequest?: Request;
  onRequestSelect: (assetId: string) => void;
  onEdit: (requestId: string) => void;
  searchTerm: string;
  onSearchTerm: (term?: string) => void;
  selection: {
    selectedRowKeys: Key[];
  };
  onSelect: (selectedRowKeys: Key[], selectedRows: Request[]) => void;
  onRequestsReload: () => void;
  deleteLoading: boolean;
  onRequestDelete: (requestIds: string[]) => void;
  onRequestTableChange: (
    page: number,
    pageSize: number,
    requestState?: RequestState[] | null,
    createdByMe?: boolean,
    reviewedByMe?: boolean,
  ) => void;
  totalCount: number;
  reviewedByMe: boolean;
  createdByMe: boolean;
  requestState: RequestState[];
  page: number;
  pageSize: number;
  columns: Record<string, ColumnsState>;
  onColumnsChange: (cols: Record<string, ColumnsState>) => void;
  hasCloseRight: boolean;
};

const RequestListMolecule: React.FC<Props> = ({
  commentsPanel,
  requests,
  loading,
  selectedRequest,
  onRequestSelect,
  onEdit,
  searchTerm,
  onSearchTerm,
  selection,
  onSelect,
  onRequestsReload,
  deleteLoading,
  onRequestDelete,
  onRequestTableChange,
  totalCount,
  reviewedByMe,
  createdByMe,
  requestState,
  page,
  pageSize,
  columns,
  onColumnsChange,
  hasCloseRight,
}) => {
  const t = useT();

  return (
    <ComplexInnerContents
      center={
        <Content>
          <StyledPageHeader title={t("Request")} />
          <RequestListTable
            requests={requests}
            selection={selection}
            loading={loading}
            searchTerm={searchTerm}
            onSearchTerm={onSearchTerm}
            onEdit={onEdit}
            deleteLoading={deleteLoading}
            onRequestDelete={onRequestDelete}
            onRequestsReload={onRequestsReload}
            onSelect={onSelect}
            onRequestSelect={onRequestSelect}
            selectedRequest={selectedRequest}
            onRequestTableChange={onRequestTableChange}
            totalCount={totalCount}
            reviewedByMe={reviewedByMe}
            createdByMe={createdByMe}
            requestState={requestState}
            page={page}
            pageSize={pageSize}
            columns={columns}
            onColumnsChange={onColumnsChange}
            hasCloseRight={hasCloseRight}
          />
        </Content>
      }
      right={commentsPanel}
    />
  );
};

const Content = styled.div`
  width: 100%;
  background-color: #fff;
`;

const StyledPageHeader = styled(PageHeader)`
  border-bottom: 1px solid #00000008;
`;

export default RequestListMolecule;
