import styled from "@emotion/styled";
import { useMemo } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import ProTable, { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import Radio from "@reearth-cms/components/atoms/Radio";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

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
  onRequestTableReload: () => void;
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
  onRequestTableReload,
}) => {
  const t = useT();
  const { pagination, submit, resetFlag, selectedRequestId, setSelectedRequestId } = useHooks(
    itemIds,
    onLinkItemRequestModalCancel,
    requestList,
    requestModalTotalCount,
    requestModalPage,
    requestModalPageSize,
    onChange,
  );

  const columns: ProColumns<Request>[] = useMemo(
    () => [
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
        render: (_, request) => (
          <Space>
            <div>
              {request.reviewers
                .filter((_, index) => index < 3)
                .map(reviewer => (
                  <StyledUserAvatar key={reviewer.name} username={reviewer.name} size={"small"} />
                ))}
            </div>
            {request.reviewers.map(reviewer => reviewer.name).join(", ")}
          </Space>
        ),
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        key: "createdAt",
        render: (_text, record) => dateTimeFormat(record.createdAt),
      },
    ],
    [selectedRequestId, setSelectedRequestId, t],
  );

  const options = {
    reload: onRequestTableReload,
  };

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
        options={options}
        toolbar={toolbar}
        scroll={{ x: "max-content", y: 330 }}
      />
    </Modal>
  );
};

export default LinkItemRequestModal;

const StyledUserAvatar = styled(UserAvatar)`
  :nth-child(1) {
    z-index: 2;
  }
  :nth-child(2) {
    z-index: 1;
  }
  :nth-child(n + 2) {
    margin-left: -18px;
  }
`;

const StyledProTable = styled(ProTable)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
