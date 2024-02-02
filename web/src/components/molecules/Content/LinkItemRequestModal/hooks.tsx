import { useState, useRef, useMemo, useCallback } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Input from "@reearth-cms/components/atoms/Input";
import { ProColumns, TablePaginationConfig } from "@reearth-cms/components/atoms/ProTable";
import Radio from "@reearth-cms/components/atoms/Radio";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

export default (
  itemIds: string[],
  onLinkItemRequestModalCancel: () => void,
  requestList: Request[],
  onRequestSearchTerm: (term: string) => void,
  requestModalTotalCount: number,
  requestModalPage: number,
  requestModalPageSize: number,
  onChange?: (value: Request, itemIds: string[]) => void,
) => {
  const t = useT();
  const [selectedRequestId, setSelectedRequestId] = useState<string>();

  const pagination: TablePaginationConfig = useMemo(
    () => ({
      showSizeChanger: true,
      current: requestModalPage,
      total: requestModalTotalCount,
      pageSize: requestModalPageSize,
    }),
    [requestModalPage, requestModalTotalCount, requestModalPageSize],
  );

  const submit = useCallback(() => {
    onChange?.(requestList.find(request => request.id === selectedRequestId) as Request, itemIds);
    setSelectedRequestId(undefined);
    onLinkItemRequestModalCancel();
  }, [itemIds, onChange, onLinkItemRequestModalCancel, requestList, selectedRequestId]);

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
        render: (_, request) => request.reviewers.map(reviewer => reviewer.name).join(", "),
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        key: "createdAt",
        render: (_text, record) => dateTimeFormat(record.createdAt),
      },
    ],
    [selectedRequestId, t],
  );

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

  return { pagination, submit, columns, toolbar, resetFlag };
};
