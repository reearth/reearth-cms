import styled from "@emotion/styled";

import Modal from "@reearth-cms/components/atoms/Modal";
import ProTable from "@reearth-cms/components/atoms/ProTable";

import { FormItem } from "../types";

import useHooks from "./hooks";

type Props = {
  onChange?: (value: string) => void;
  linkedItemsModalList?: FormItem[];
  visible?: boolean;
  linkedItem?: string;
  correspondingFieldId: string;
  linkItemModalTitle?: string;
  linkItemModalTotalCount?: number;
  linkItemModalPage?: number;
  linkItemModalPageSize?: number;
  onSearchTerm: (term?: string) => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onLinkItemModalCancel: () => void;
};

const LinkItemModal: React.FC<Props> = ({
  visible,
  correspondingFieldId,
  linkedItemsModalList,
  linkedItem,
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onSearchTerm,
  onLinkItemTableChange,
  onLinkItemModalCancel,
  onChange,
}) => {
  const { columns, toolbar, pagination } = useHooks(
    correspondingFieldId,
    onSearchTerm,
    onLinkItemModalCancel,
    onChange,
    linkItemModalTotalCount,
    linkItemModalPage,
    linkItemModalPageSize,
    linkedItem,
    visible,
  );

  return (
    <Modal
      open={visible}
      title={linkItemModalTitle}
      centered
      width="70vw"
      footer={null}
      onCancel={onLinkItemModalCancel}
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        padding: "12px",
      }}>
      <StyledProTable
        dataSource={linkedItemsModalList}
        columns={columns}
        search={false}
        rowKey="id"
        options={false}
        toolbar={toolbar}
        pagination={pagination}
        onChange={pagination => {
          onLinkItemTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
        }}
        scroll={{ x: "max-content", y: 330 }}
      />
    </Modal>
  );
};

export default LinkItemModal;

const StyledProTable = styled(ProTable)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
