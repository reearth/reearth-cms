import styled from "@emotion/styled";

import Modal from "@reearth-cms/components/atoms/Modal";
import ProTable from "@reearth-cms/components/atoms/ProTable";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

type Props = {
  itemIds: string[];
  visible: boolean;
  onLinkItemRequestModalCancel: () => void;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  onRequestTableChange: (page: number, pageSize: number) => void;
  linkedRequest?: Request;
  requestList: Request[];
  onChange?: (value: Request, itemIds: string[]) => void;
  onRequestSearchTerm: (term: string) => void;
};

const LinkItemRequestModal: React.FC<Props> = ({
  itemIds,
  visible,
  onLinkItemRequestModalCancel,
  requestList,
  onRequestTableChange,
  requestModalLoading,
  requestModalTotalCount,
  requestModalPage,
  requestModalPageSize,
  onChange,
  onRequestSearchTerm,
}) => {
  const t = useT();
  const { pagination, submit, columns, toolbar, resetFlag } = useHooks(
    itemIds,
    onLinkItemRequestModalCancel,
    requestList,
    onRequestSearchTerm,
    requestModalTotalCount,
    requestModalPage,
    requestModalPageSize,
    onChange,
  );

  return (
    <Modal
      open={visible}
      title={t("Add to Request")}
      centered
      onOk={submit}
      onCancel={onLinkItemRequestModalCancel}
      width="70vw"
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        padding: "12px 12px 0",
      }}
      afterClose={() => {
        resetFlag.current = !resetFlag.current;
      }}>
      <StyledProTable
        dataSource={requestList}
        columns={columns}
        search={false}
        rowKey="id"
        pagination={pagination}
        loading={requestModalLoading}
        onChange={pagination => {
          onRequestTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
        }}
        toolbar={toolbar}
        scroll={{ x: "max-content", y: 330 }}
      />
    </Modal>
  );
};

export default LinkItemRequestModal;

const StyledProTable = styled(ProTable)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
