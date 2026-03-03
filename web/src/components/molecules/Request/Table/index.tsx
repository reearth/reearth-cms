import styled from "@emotion/styled";
import { Key, useCallback, useMemo } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import Icon from "@reearth-cms/components/atoms/Icon";
import {
  ColumnsState,
  ListToolBarProps,
  OptionConfig,
  StretchColumn,
  TableRowSelection,
} from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import Space from "@reearth-cms/components/atoms/Space";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { Request, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { badgeColors } from "@reearth-cms/components/molecules/Request/utils";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

type Props = {
  columns: Record<string, ColumnsState>;
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

const RequestListTable: React.FC<Props> = ({
  columns: columnsState,
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

  const columns: StretchColumn<Request>[] = useMemo(
    () => [
      {
        align: "center",
        hideInSetting: true,
        key: "EDIT_ICON",
        minWidth: 48,
        render: (_, request) => (
          <Icon color={"#1890ff"} icon="edit" onClick={() => onEdit(request.id)} />
        ),
        title: "",
        width: 48,
      },
      {
        align: "center",
        dataIndex: "commentsCount",
        hideInSetting: true,
        key: "commentsCount",
        minWidth: 48,
        render: (_, request) => {
          return (
            <CommentsButton onClick={() => onRequestSelect(request.id)} type="link">
              <CustomTag
                color={request.id === selectedRequest?.id ? "#87e8de" : undefined}
                value={request.comments?.length || 0}
              />
            </CommentsButton>
          );
        },
        title: () => <Icon icon="message" />,
        width: 48,
      },
      {
        dataIndex: "title",
        ellipsis: true,
        key: "title",
        minWidth: 100,
        title: t("Title"),
        width: 100,
      },
      {
        dataIndex: "requestState",
        defaultFilteredValue: requestState,
        filters: [
          { text: t("WAITING"), value: "WAITING" },
          { text: t("APPROVED"), value: "APPROVED" },
          { text: t("CLOSED"), value: "CLOSED" },
          { text: t("DRAFT"), value: "DRAFT" },
        ],
        key: "requestState",
        minWidth: 130,
        render: (_, request) => (
          <Badge color={badgeColors[request.state]} text={t(request.state)} />
        ),
        title: t("State"),
        width: 130,
      },
      {
        dataIndex: "createdBy.name",
        defaultFilteredValue: createdByMe ? ["createdByMe"] : null,
        ellipsis: true,
        filters: true,
        key: "createdBy",
        minWidth: 105,
        render: (_, request) => request.createdBy?.name,
        title: t("Created By"),
        valueEnum: {
          all: { status: "Default", text: "All" },
          createdByMe: {
            text: t("Current user"),
          },
        },
        width: 105,
      },
      {
        dataIndex: "reviewers.name",
        defaultFilteredValue: reviewedByMe ? ["reviewedByMe"] : null,
        ellipsis: true,
        filters: true,
        key: "reviewers",
        minWidth: 105,
        render: (_, request) => request.reviewers.map(reviewer => reviewer.name).join(", "),
        title: t("Reviewers"),
        valueEnum: {
          all: { status: "Default", text: "All" },
          reviewedByMe: {
            text: t("Current user"),
          },
        },
        width: 105,
      },
      {
        dataIndex: "createdAt",
        key: "createdAt",
        minWidth: 150,
        render: (_text, record) => dateTimeFormat(record.createdAt),
        title: t("Created At"),
        width: 150,
      },
      {
        dataIndex: "updatedAt",
        key: "updatedAt",
        minWidth: 150,
        render: (_text, record) => dateTimeFormat(record.createdAt),
        title: t("Updated At"),
        width: 150,
      },
    ],
    [createdByMe, onEdit, onRequestSelect, requestState, reviewedByMe, selectedRequest?.id, t],
  );

  const options: OptionConfig = useMemo(
    () => ({
      fullScreen: true,
      reload: onRequestsReload,
      search: true,
    }),
    [onRequestsReload],
  );

  const pagination = useMemo(
    () => ({
      current: page,
      pageSize: pageSize,
      showSizeChanger: true,
      total: totalCount,
    }),
    [page, pageSize, totalCount],
  );

  const rowSelection: TableRowSelection = useMemo(
    () => ({
      onChange: onSelect,
      selectedRowKeys: selection.selectedRowKeys,
    }),
    [onSelect, selection.selectedRowKeys],
  );

  const handleToolbarEvents: ListToolBarProps = useMemo(
    () => ({
      search: (
        <Search
          allowClear
          defaultValue={searchTerm}
          onSearch={(value: string) => {
            onSearchTerm(value);
          }}
          placeholder={t("input search text")}
        />
      ),
    }),
    [onSearchTerm, searchTerm, t],
  );

  const alertOptions = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      return (
        <Space size={4}>
          <Button
            danger
            disabled={!hasCloseRight}
            icon={<Icon icon="delete" />}
            loading={deleteLoading}
            onClick={() => onRequestDelete(props.selectedRowKeys)}
            size="small"
            type="link">
            {t("Close")}
          </Button>
        </Space>
      );
    },
    [deleteLoading, onRequestDelete, t, hasCloseRight],
  );

  return (
    <ResizableProTable
      columns={columns}
      columnsState={{
        defaultValue: {},
        onChange: onColumnsChange,
        value: columnsState,
      }}
      dataSource={requests}
      heightOffset={73}
      loading={loading}
      onChange={(pagination, filters) => {
        onRequestTableChange(
          pagination.current ?? 1,
          pagination.pageSize ?? 10,
          filters?.requestState as null | RequestState[],
          !!filters.createdBy?.[0],
          !!filters?.reviewers?.[0],
        );
      }}
      options={options}
      pagination={pagination}
      rowKey="id"
      rowSelection={rowSelection}
      search={false}
      tableAlertOptionRender={alertOptions}
      toolbar={handleToolbarEvents}
    />
  );
};

export default RequestListTable;

const CommentsButton = styled(Button)`
  padding: 0;
`;
