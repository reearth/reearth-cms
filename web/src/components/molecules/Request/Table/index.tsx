import styled from "@emotion/styled";
import { Key } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import Icon from "@reearth-cms/components/atoms/Icon";
import ProTable, {
  ListToolBarProps,
  ProColumns,
  OptionConfig,
  TableRowSelection,
  TablePaginationConfig,
} from "@reearth-cms/components/atoms/ProTable";
import Space from "@reearth-cms/components/atoms/Space";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";
import { dateSortCallback } from "@reearth-cms/utils/sort";

export type Props = {
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
}) => {
  const t = useT();

  const columns: ProColumns<Request>[] = [
    {
      title: "",
      render: (_, request) => (
        <Button type="link" icon={<Icon icon="edit" />} onClick={() => onEdit(request)} />
      ),
    },
    {
      title: () => <Icon icon="message" />,
      dataIndex: "commentsCount",
      key: "commentsCount",
      render: (_, request) => {
        return (
          <Button type="link" onClick={() => onRequestSelect(request.id)}>
            <CustomTag
              value={request.comments?.length || 0}
              color={request.id === selectedRequest?.id ? "#87e8de" : undefined}
            />
          </Button>
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
      title: t("Reviewers"),
      dataIndex: "reviewers.name",
      key: "reviewers",
      render: (_, request) => request.reviewers.map(reviewer => reviewer.name).join(", "),
    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => dateSortCallback(a.createdAt, b.createdAt),
      render: (_text, record) => dateTimeFormat(record.createdAt),
    },
    {
      title: t("Updated At"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => dateSortCallback(a.createdAt, b.createdAt),
      render: (_text, record) => dateTimeFormat(record.createdAt),
    },
  ];

  const options: OptionConfig = {
    search: true,
    reload: onRequestsReload,
  };

  const pagination: TablePaginationConfig = {
    showSizeChanger: false,
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
        <DownloadButton displayDefaultIcon type="link" selected={props.selectedRows} />
        <DeleteButton onClick={() => onRequestDelete?.(props.selectedRowKeys)}>
          <Icon icon="delete" /> {t("Close")}
        </DeleteButton>
      </Space>
    );
  };

  return (
    <ProTable
      dataSource={requests}
      columns={columns}
      tableAlertOptionRender={AlertOptions}
      search={false}
      rowKey="id"
      options={options}
      pagination={pagination}
      toolbar={handleToolbarEvents}
      rowSelection={rowSelection}
      tableStyle={{ overflowX: "scroll" }}
      loading={loading}
    />
  );
};

export default RequestListTable;

const DeselectButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteButton = styled.a`
  color: #ff7875;
`;
