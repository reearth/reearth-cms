import styled from "@emotion/styled";
import { useMemo } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Modal from "@reearth-cms/components/atoms/Modal";
import { StretchColumn } from "@reearth-cms/components/atoms/ProTable";
import Radio from "@reearth-cms/components/atoms/Radio";
import Search from "@reearth-cms/components/atoms/Search";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { Request, RequestItem } from "@reearth-cms/components/molecules/Request/types";
import { badgeColors } from "@reearth-cms/components/molecules/Request/utils";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import useHooks from "./hooks";

type Props = {
  items: RequestItem[];
  visible: boolean;
  onLinkItemRequestModalCancel: () => void;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  onRequestTableChange: (page: number, pageSize: number) => void;
  requestList: Request[];
  onChange: (value: Request, items: RequestItem[]) => Promise<void>;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableReload: () => void;
};

const LinkItemRequestModal: React.FC<Props> = ({
  items,
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
  const { pagination, submit, resetFlag, selectedRequestId, select, isDisabled, isLoading } =
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
        title: "",
        hideInSetting: true,
        fixed: "left",
        align: "center",
        width: 32,
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
      },
      {
        title: t("Title"),
        dataIndex: "title",
        key: "title",
        ellipsis: true,
        width: 200,
        minWidth: 200,
      },
      {
        title: t("State"),
        dataIndex: "requestState",
        key: "requestState",
        ellipsis: true,
        width: 130,
        minWidth: 130,
        render: (_, request) => (
          <Badge color={badgeColors[request.state]} text={t(request.state)} />
        ),
      },
      {
        title: t("Created By"),
        dataIndex: ["createdBy", "name"],
        key: "createdBy",
        ellipsis: true,
        width: 100,
        minWidth: 100,
        render: (_, request) => (
          <Space>
            <UserAvatar username={request.createdBy?.name} size="small" />
            {request.createdBy?.name}
          </Space>
        ),
      },
      {
        title: t("Reviewers"),
        dataIndex: "reviewers.name",
        key: "reviewers",
        ellipsis: true,
        width: 130,
        minWidth: 130,
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
        ellipsis: true,
        width: 130,
        minWidth: 130,
        render: (_text, record) => dateTimeFormat(record.createdAt),
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
        placeholder={t("input search text")}
        onSearch={onRequestSearchTerm}
        key={+resetFlag.current}
      />
    ),
  };

  return (
    <StyledModal
      open={visible}
      title={t("Add to Request")}
      centered
      onOk={submit}
      onCancel={onLinkItemRequestModalCancel}
      width="70vw"
      styles={{
        body: {
          height: "70vh",
        },
      }}
      afterClose={() => {
        resetFlag.current = !resetFlag.current;
      }}
      confirmLoading={isLoading}
      cancelButtonProps={{ disabled: isLoading }}
      okButtonProps={{ disabled: isDisabled }}>
      <ResizableProTable
        dataSource={requestList}
        columns={columns}
        search={false}
        pagination={pagination}
        loading={requestModalLoading}
        onChange={pagination => {
          onRequestTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
        }}
        options={options}
        toolbar={toolbar}
        heightOffset={0}
      />
    </StyledModal>
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

const StyledModal = styled(Modal)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
