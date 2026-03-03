import styled from "@emotion/styled";
import { useMemo } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Modal from "@reearth-cms/components/atoms/Modal";
import { StretchColumn } from "@reearth-cms/components/atoms/ProTable";
import Radio from "@reearth-cms/components/atoms/Radio";
import Search from "@reearth-cms/components/atoms/Search";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { Request, RequestItem } from "@reearth-cms/components/molecules/Request/types";
import { badgeColors } from "@reearth-cms/components/molecules/Request/utils";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import useHooks from "./hooks";

type Props = {
  items: RequestItem[];
  onChange: (value: Request, items: RequestItem[]) => Promise<void>;
  onLinkItemRequestModalCancel: () => void;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onRequestTableReload: () => void;
  requestList: Request[];
  requestModalLoading: boolean;
  requestModalPage: number;
  requestModalPageSize: number;
  requestModalTotalCount: number;
  visible: boolean;
};

const LinkItemRequestModal: React.FC<Props> = ({
  items,
  onChange,
  onLinkItemRequestModalCancel,
  onRequestSearchTerm,
  onRequestTableChange,
  onRequestTableReload,
  requestList,
  requestModalLoading,
  requestModalPage,
  requestModalPageSize,
  requestModalTotalCount,
  visible,
}) => {
  const t = useT();
  const { isDisabled, isLoading, pagination, resetFlag, select, selectedRequestId, submit } =
    useHooks(
      items,
      onLinkItemRequestModalCancel,
      requestList,
      requestModalTotalCount,
      requestModalPage,
      requestModalPageSize,
      onChange,
    );

  const columns: StretchColumn<Request>[] = useMemo(
    () => [
      {
        align: "center",
        fixed: "left",
        hideInSetting: true,
        minWidth: 32,
        render: (_, request) => {
          return (
            <Radio.Group
              onChange={() => {
                select(request.id);
              }}
              value={selectedRequestId}>
              <Radio value={request.id} />
            </Radio.Group>
          );
        },
        title: "",
        width: 32,
      },
      {
        dataIndex: "title",
        ellipsis: true,
        key: "title",
        minWidth: 200,
        title: t("Title"),
        width: 200,
      },
      {
        dataIndex: "requestState",
        ellipsis: true,
        key: "requestState",
        minWidth: 130,
        render: (_, request) => (
          <Badge color={badgeColors[request.state]} text={t(request.state)} />
        ),
        title: t("State"),
        width: 130,
      },
      {
        dataIndex: ["createdBy", "name"],
        ellipsis: true,
        key: "createdBy",
        minWidth: 100,
        render: (_, request) => request.createdBy?.name,
        title: t("Created By"),
        width: 100,
      },
      {
        dataIndex: "reviewers.name",
        ellipsis: true,
        key: "reviewers",
        minWidth: 130,
        render: (_, request) => request.reviewers.map(reviewer => reviewer.name).join(", "),
        title: t("Reviewers"),
        width: 130,
      },
      {
        dataIndex: "createdAt",
        ellipsis: true,
        key: "createdAt",
        minWidth: 130,
        render: (_text, record) => dateTimeFormat(record.createdAt),
        title: t("Created At"),
        width: 130,
      },
    ],
    [selectedRequestId, select, t],
  );

  const options = useMemo(
    () => ({
      reload: onRequestTableReload,
    }),
    [onRequestTableReload],
  );

  const toolbar = {
    search: (
      <Search
        allowClear
        key={+resetFlag.current}
        onSearch={onRequestSearchTerm}
        placeholder={t("input search text")}
      />
    ),
  };

  return (
    <StyledModal
      afterClose={() => {
        resetFlag.current = !resetFlag.current;
      }}
      cancelButtonProps={{ disabled: isLoading }}
      centered
      confirmLoading={isLoading}
      okButtonProps={{ disabled: isDisabled }}
      onCancel={onLinkItemRequestModalCancel}
      onOk={submit}
      open={visible}
      styles={{
        body: {
          height: "70vh",
        },
      }}
      title={t("Add to Request")}
      width="70vw">
      <ResizableProTable
        columns={columns}
        dataSource={requestList}
        heightOffset={0}
        loading={requestModalLoading}
        onChange={pagination => {
          onRequestTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
        }}
        options={options}
        pagination={pagination}
        search={false}
        toolbar={toolbar}
      />
    </StyledModal>
  );
};

export default LinkItemRequestModal;

const StyledModal = styled(Modal)`
  .ant-pro-card-body {
    padding: 0;

    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
