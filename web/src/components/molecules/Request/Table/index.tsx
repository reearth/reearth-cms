import styled from "@emotion/styled";
import { Key, useEffect, useState } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import Icon from "@reearth-cms/components/atoms/Icon";
import ProTable, {
  ListToolBarProps,
  ProColumns,
  OptionConfig,
  TableRowSelection,
  TablePaginationConfig,
} from "@reearth-cms/components/atoms/ProTable";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { Request, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

export type Props = {
  requests: Request[];
  loading: boolean;
  selectedRequest: Request | undefined;
  onRequestSelect: (assetId: string) => void;
  onEdit: (requestId: string) => void;
  onSearchTerm: (term?: string) => void;
  selection: {
    selectedRowKeys: Key[];
  };
  setSelection: (input: { selectedRowKeys: Key[] }) => void;
  onRequestsReload: () => void;
  onRequestDelete: (requestIds: string[]) => void;
  onRequestTableChange: (
    page: number,
    pageSize: number,
    requestState?: RequestState[] | null,
    createdByMe?: boolean,
    reviewedByMe?: boolean,
  ) => void;
  totalCount: number;
  searchTerm: string;
  reviewedByMe: boolean;
  createdByMe: boolean;
  requestState: RequestState[];
  page: number;
  pageSize: number;
};

const RequestListTable: React.FC<Props> = ({
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
  onRequestTableChange,
  totalCount,
  searchTerm,
  reviewedByMe,
  createdByMe,
  requestState,
  page,
  pageSize,
}) => {
  const t = useT();

  const columns: ProColumns<Request>[] = [
    {
      title: "",
      render: (_, request) => (
        <Button type="link" icon={<Icon icon="edit" />} onClick={() => onEdit(request.id)} />
      ),
      width: 48,
      align: "center",
    },
    {
      title: () => <Icon icon="message" />,
      dataIndex: "commentsCount",
      key: "commentsCount",
      render: (_, request) => {
        return (
          <CommentsButton type="link" onClick={() => onRequestSelect(request.id)}>
            <CustomTag
              value={request.comments?.length || 0}
              color={request.id === selectedRequest?.id ? "#87e8de" : undefined}
            />
          </CommentsButton>
        );
      },
      width: 48,
      align: "center",
    },
    {
      title: t("Title"),
      dataIndex: "title",
      key: "title",
      width: 100,
      ellipsis: true,
    },
    {
      title: t("State"),
      dataIndex: "requestState",
      key: "requestState",
      render: (_, request) => {
        let color = "";
        let text = t("DRAFT");
        switch (request.state) {
          case "APPROVED":
            color = "#52C41A";
            text = t("APPROVED");
            break;
          case "CLOSED":
            color = "#F5222D";
            text = t("CLOSED");
            break;
          case "WAITING":
            color = "#FA8C16";
            text = t("WAITING");
            break;
          case "DRAFT":
          default:
            break;
        }
        return <Badge color={color} text={text} />;
      },
      filters: [
        { text: t("WAITING"), value: "WAITING" },
        { text: t("APPROVED"), value: "APPROVED" },
        { text: t("CLOSED"), value: "CLOSED" },
        { text: t("DRAFT"), value: "DRAFT" },
      ],
      defaultFilteredValue: requestState,
      width: 100,
    },
    {
      title: t("Created By"),
      dataIndex: "createdBy.name",
      key: "createdBy",
      render: (_, request) => (
        <Space>
          <UserAvatar username={request.createdBy?.name} size={"small"} />
          {request.createdBy?.name}
        </Space>
      ),
      valueEnum: {
        all: { text: "All", status: "Default" },
        createdByMe: {
          text: t("Current user"),
        },
      },
      filters: true,
      defaultFilteredValue: createdByMe ? ["createdByMe"] : null,
      width: 105,
      ellipsis: true,
    },
    {
      title: t("Reviewers"),
      dataIndex: "reviewers.name",
      key: "reviewers",
      render: (_, request) => (
        <Space>
          <div>
            {request.reviewers.map(reviewer => (
              <StyledUserAvatar key={reviewer.name} username={reviewer.name} size={"small"} />
            ))}
          </div>
          {request.reviewers.map(reviewer => reviewer.name).join(", ")}
        </Space>
      ),
      valueEnum: {
        all: { text: "All", status: "Default" },
        reviewedByMe: {
          text: t("Current user"),
        },
      },
      filters: true,
      defaultFilteredValue: reviewedByMe ? ["reviewedByMe"] : null,
      width: 105,
      ellipsis: true,
    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_text, record) => dateTimeFormat(record.createdAt),
      width: 150,
    },
    {
      title: t("Updated At"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (_text, record) => dateTimeFormat(record.createdAt),
      width: 150,
    },
  ];

  const options: OptionConfig = {
    search: true,
    reload: onRequestsReload,
  };

  const pagination: TablePaginationConfig = {
    showSizeChanger: true,
    current: page,
    total: totalCount,
    pageSize: pageSize,
  };

  const rowSelection: TableRowSelection = {
    selectedRowKeys: selection.selectedRowKeys,
    onChange: (selectedRowKeys: any) => {
      setSelection({
        ...selection,
        selectedRowKeys: selectedRowKeys,
      });
    },
  };

  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      defaultValue: searchTerm,
      onSearch: (value: string) => {
        if (value) {
          onSearchTerm(value);
        } else {
          onSearchTerm();
        }
      },
    },
  };

  const AlertOptions = (props: any) => {
    return (
      <Space size={16}>
        <DeselectButton onClick={props.onCleanSelected}>
          <Icon icon="clear" /> {t("Deselect")}
        </DeselectButton>
        <DeleteButton onClick={() => onRequestDelete?.(props.selectedRowKeys)}>
          <Icon icon="delete" /> {t("Close")}
        </DeleteButton>
      </Space>
    );
  };

  const [isRowSelected, setIsRowSelected] = useState(false);
  useEffect(() => {
    if (selection.selectedRowKeys.length) {
      setIsRowSelected(true);
    } else {
      setIsRowSelected(false);
    }
  }, [selection.selectedRowKeys.length]);

  return (
    <StyledProTable
      dataSource={requests}
      columns={columns}
      tableAlertOptionRender={AlertOptions}
      search={false}
      rowKey="id"
      options={options}
      pagination={pagination}
      toolbar={handleToolbarEvents}
      rowSelection={rowSelection}
      isRowSelected={isRowSelected}
      loading={loading}
      onChange={(pagination, filters) => {
        onRequestTableChange(
          pagination.current ?? 1,
          pagination.pageSize ?? 10,
          filters?.requestState as RequestState[] | null,
          !!filters.createdBy?.[0],
          !!filters?.reviewers?.[0],
        );
      }}
      scroll={{ x: "", y: "" }}
    />
  );
};

export default RequestListTable;

const CommentsButton = styled(Button)`
  padding: 0;
`;

const StyledUserAvatar = styled(UserAvatar)`
  :nth-child(1) {
    z-index: 1;
  }
  :nth-child(n + 2) {
    margin-left: -18px;
  }
`;

const DeselectButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteButton = styled.a`
  color: #ff7875;
`;

const StyledProTable = styled(ProTable)<{ isRowSelected: boolean }>`
  height: calc(100% - 72px);
  .ant-pro-card-body {
    padding-bottom: 0;
  }
  .ant-pro-card,
  .ant-pro-card-body,
  .ant-spin-nested-loading,
  .ant-spin-container,
  .ant-table-container {
    height: 100%;
  }
  .ant-table-wrapper {
    height: ${({ isRowSelected }) => `calc(100% - ${isRowSelected ? 128 : 64}px)`};
  }
  .ant-table {
    height: calc(100% - 64px);
  }
  .ant-table-small,
  .ant-table-middle {
    height: calc(100% - 56px);
  }
  .ant-table-body {
    overflow: auto !important;
    height: calc(100% - 47px);
  }
`;
