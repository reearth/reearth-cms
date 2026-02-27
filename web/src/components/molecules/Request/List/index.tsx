import styled from "@emotion/styled";
import { Key } from "react";

import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ColumnsState } from "@reearth-cms/components/atoms/ProTable";
import RequestListTable from "@reearth-cms/components/molecules/Request/Table";
import { Request, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  columns: Record<string, ColumnsState>;
  commentsPanel: JSX.Element;
  createdByMe: boolean;
  deleteLoading: boolean;
  hasCloseRight: boolean;
  loading: boolean;
  onColumnsChange: (cols: Record<string, ColumnsState>) => void;
  onEdit: (requestId: string) => void;
  onRequestDelete: (requestIds: string[]) => void;
  onRequestSelect: (assetId: string) => void;
  onRequestsReload: () => void;
  onRequestTableChange: (
    page: number,
    pageSize: number,
    requestState?: null | RequestState[],
    createdByMe?: boolean,
    reviewedByMe?: boolean,
  ) => void;
  onSearchTerm: (term?: string) => void;
  onSelect: (selectedRowKeys: Key[], selectedRows: Request[]) => void;
  page: number;
  pageSize: number;
  requests: Request[];
  requestState: RequestState[];
  reviewedByMe: boolean;
  searchTerm: string;
  selectedRequest?: Request;
  selection: {
    selectedRowKeys: Key[];
  };
  totalCount: number;
};

const RequestListMolecule: React.FC<Props> = ({
  columns,
  commentsPanel,
  createdByMe,
  deleteLoading,
  hasCloseRight,
  loading,
  onColumnsChange,
  onEdit,
  onRequestDelete,
  onRequestSelect,
  onRequestsReload,
  onRequestTableChange,
  onSearchTerm,
  onSelect,
  page,
  pageSize,
  requests,
  requestState,
  reviewedByMe,
  searchTerm,
  selectedRequest,
  selection,
  totalCount,
}) => {
  const t = useT();

  return (
    <ComplexInnerContents
      center={
        <Content>
          <StyledPageHeader title={t("Request")} />
          <RequestListTable
            columns={columns}
            createdByMe={createdByMe}
            deleteLoading={deleteLoading}
            hasCloseRight={hasCloseRight}
            loading={loading}
            onColumnsChange={onColumnsChange}
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
            onRequestSelect={onRequestSelect}
            onRequestsReload={onRequestsReload}
            onRequestTableChange={onRequestTableChange}
            onSearchTerm={onSearchTerm}
            onSelect={onSelect}
            page={page}
            pageSize={pageSize}
            requests={requests}
            requestState={requestState}
            reviewedByMe={reviewedByMe}
            searchTerm={searchTerm}
            selectedRequest={selectedRequest}
            selection={selection}
            totalCount={totalCount}
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
