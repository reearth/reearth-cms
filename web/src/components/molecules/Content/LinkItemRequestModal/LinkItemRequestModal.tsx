import styled from "@emotion/styled";
import { useState, useRef } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import ProTable, {
  ProColumns,
  TablePaginationConfig,
} from "@reearth-cms/components/atoms/ProTable";
import Radio from "@reearth-cms/components/atoms/Radio";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

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
  const [selectedRequestId, setSelectedRequestId] = useState<string>();
  const t = useT();

  const pagination: TablePaginationConfig = {
    showSizeChanger: true,
    current: requestModalPage,
    total: requestModalTotalCount,
    pageSize: requestModalPageSize,
  };

  const submit = () => {
    onChange?.(requestList.find(request => request.id === selectedRequestId) as Request, itemIds);
    setSelectedRequestId(undefined);
    onLinkItemRequestModalCancel();
  };

  const columns: ProColumns<Request>[] = [
    {
      title: "",
      render: (_, request) => {
        return (
          <Radio.Group
            onChange={() => {
              setSelectedRequestId(request.id);
            }}
            value={selectedRequestId}>
            <Radio value={request.id} />
          </Radio.Group>
        );
      },
      width: 32,
    },
    {
      title: t("Title"),
      dataIndex: "title",
      key: "title",
    },
    {
      title: t("State"),
      dataIndex: "requestState",
      key: "requestState",
      render: (_, request) => {
        let color = "";
        switch (request.state) {
          case "APPROVED":
            color = "#52C41A";
            break;
          case "CLOSED":
            color = "#F5222D";
            break;
          case "WAITING":
            color = "#FA8C16";
            break;
          case "DRAFT":
          default:
            break;
        }
        return <Badge color={color} text={request.state} />;
      },
    },
    {
      title: t("Created By"),
      dataIndex: "createdBy.name",
      key: "createdBy",
      render: (_, request) => {
        return request.createdBy?.name;
      },
    },
    {
      title: t("Reviewers"),
      dataIndex: "reviewers.name",
      key: "reviewers",
      render: (_, request) => request.reviewers.map(reviewer => reviewer.name).join(", "),
    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_text, record) => dateTimeFormat(record.createdAt),
    },
  ];

  const resetFlag = useRef(false);

  const toolbar = {
    search: (
      <Input.Search
        placeholder={t("Please enter")}
        onSearch={onRequestSearchTerm}
        key={+resetFlag.current}
      />
    ),
  };

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
