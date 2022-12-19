import { useState } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
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
  visible: boolean;
  onLinkItemRequestModalCancel: () => void;
  linkedRequest?: Request;
  requestList: Request[];
  onChange?: (value: Request) => void;
};

const LinkItemRequestModal: React.FC<Props> = ({
  visible,
  onLinkItemRequestModalCancel,
  requestList,
  onChange,
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState<string>();
  const t = useT();

  const pagination: TablePaginationConfig = {
    pageSize: 5,
    showSizeChanger: false,
  };

  const submit = () => {
    onChange?.(requestList.find(request => request.id === selectedRequestId) as Request);
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
      title: t("reviewers"),
      dataIndex: "reviewers.name",
      key: "reviewers",
      render: (_, request) => {
        return request.reviewers.map(reviewer => reviewer.name);
      },
    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_text, record) => dateTimeFormat(record.createdAt),
    },
    {
      title: t("Created By"),
      dataIndex: "createdBy",
      key: "createdBy",
    },
  ];

  return (
    <Modal
      visible={visible}
      title={t("Add to Request")}
      centered
      onOk={submit}
      onCancel={onLinkItemRequestModalCancel}
      width="70vw"
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        paddingBottom: "80px",
      }}>
      <ProTable
        dataSource={requestList}
        columns={columns}
        search={false}
        rowKey="id"
        options={false}
        pagination={pagination}
        tableStyle={{ overflowX: "scroll" }}
      />
    </Modal>
  );
};

export default LinkItemRequestModal;
