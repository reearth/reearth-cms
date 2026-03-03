import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Request, RequestItem } from "@reearth-cms/components/molecules/Request/types";

export default (
  items: RequestItem[],
  onLinkItemRequestModalCancel: () => void,
  requestList: Request[],
  requestModalTotalCount: number,
  requestModalPage: number,
  requestModalPageSize: number,
  onChange: (value: Request, items: RequestItem[]) => Promise<void>,
) => {
  const resetFlag = useRef(false);
  const selectedRequest = useRef<Request>();
  const [selectedRequestId, setSelectedRequestId] = useState<string>();
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const pagination = useMemo(
    () => ({
      current: requestModalPage,
      pageSize: requestModalPageSize,
      showSizeChanger: true,
      total: requestModalTotalCount,
    }),
    [requestModalPage, requestModalTotalCount, requestModalPageSize],
  );

  const select = useCallback((id: string) => {
    setSelectedRequestId(id);
  }, []);

  useEffect(() => {
    setIsDisabled(!selectedRequestId);
    selectedRequest.current = requestList.find(request => request.id === selectedRequestId);
  }, [requestList, selectedRequestId]);

  const submit = useCallback(async () => {
    if (selectedRequest.current) {
      setIsDisabled(true);
      setIsLoading(true);
      try {
        await onChange(selectedRequest.current, items);
        setSelectedRequestId(undefined);
        onLinkItemRequestModalCancel();
      } catch (_) {
        setIsDisabled(false);
      } finally {
        setIsLoading(false);
      }
    }
  }, [items, onChange, onLinkItemRequestModalCancel]);

  return { isDisabled, isLoading, pagination, resetFlag, select, selectedRequestId, submit };
};
