import styled from "@emotion/styled";
import { Key } from "react";

import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import RequestListTable from "@reearth-cms/components/molecules/Request/Table";
import { Request } from "@reearth-cms/components/molecules/Request/types";

export type Props = {
  commentsPanel?: JSX.Element;
  requests: Request[];
  loading: boolean;
  selectedRequest: Request | undefined;
  onRequestSelect: (assetId: string) => void;
  onEdit: (request: Request) => void;
  onSearchTerm: (term?: string) => void;
  selection: {
    selectedRowKeys: Key[];
  };
  setSelection: (input: { selectedRowKeys: Key[] }) => void;
  onRequestsReload: () => void;
  onRequestDelete: (requestIds: string[]) => Promise<void>;
};

const RequestListMolecule: React.FC<Props> = ({
  commentsPanel,
  requests,
  loading,
  selectedRequest,
  onRequestSelect,
  onEdit,
  onSearchTerm,
  selection,
  setSelection,
  onRequestsReload,
  onRequestDelete,
}) => {
  return (
    <ComplexInnerContents
      center={
        <Content>
          <RequestListTable
            requests={requests}
            selection={selection}
            loading={loading}
            onSearchTerm={onSearchTerm}
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
            onRequestsReload={onRequestsReload}
            setSelection={setSelection}
            onRequestSelect={onRequestSelect}
            selectedRequest={selectedRequest}
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

export default RequestListMolecule;
