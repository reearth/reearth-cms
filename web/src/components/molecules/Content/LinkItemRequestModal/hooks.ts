import { useState, useRef, useMemo, useCallback } from "react";

import { Request } from "@reearth-cms/components/molecules/Request/types";

export default (
  itemIds: string[],
  onLinkItemRequestModalCancel: () => void,
  requestList: Request[],
  requestModalTotalCount: number,
  requestModalPage: number,
  requestModalPageSize: number,
  onChange?: (value: Request, itemIds: string[]) => void,
) => {
  const resetFlag = useRef(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>();

  const pagination = useMemo(
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

  return { pagination, submit, resetFlag, selectedRequestId, setSelectedRequestId };
};
