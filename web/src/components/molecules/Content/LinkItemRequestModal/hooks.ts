import { useState, useRef, useMemo, useCallback, useEffect } from "react";

import { Request } from "@reearth-cms/components/molecules/Request/types";

export default (
  itemIds: string[],
  onLinkItemRequestModalCancel: () => void,
  requestList: Request[],
  requestModalTotalCount: number,
  requestModalPage: number,
  requestModalPageSize: number,
  onChange: (value: Request, itemIds: string[]) => void,
) => {
  const resetFlag = useRef(false);
  const selectedRequest = useRef<Request>();
  const [selectedRequestId, setSelectedRequestId] = useState<string>();
  const [isDisabled, setIsDisabled] = useState(true);

  const pagination = useMemo(
    () => ({
      showSizeChanger: true,
      current: requestModalPage,
      total: requestModalTotalCount,
      pageSize: requestModalPageSize,
    }),
    [requestModalPage, requestModalTotalCount, requestModalPageSize],
  );

  const select = useCallback((id: string) => {
    setSelectedRequestId(id);
  }, []);

  useEffect(() => {
    setIsDisabled(!selectedRequestId);
    selectedRequest.current = requestList.find(request => request.id === selectedRequestId);
  }, [selectedRequestId]);

  const submit = useCallback(() => {
    if (selectedRequest.current) {
      onChange(selectedRequest.current, itemIds);
      setSelectedRequestId(undefined);
      onLinkItemRequestModalCancel();
    }
  }, [itemIds, onChange, onLinkItemRequestModalCancel, requestList, selectedRequestId]);

  return { pagination, submit, resetFlag, selectedRequestId, select, isDisabled };
};
