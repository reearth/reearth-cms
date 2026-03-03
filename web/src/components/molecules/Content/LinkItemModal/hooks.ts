import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

export default (
  linkItemModalTotalCount?: number,
  linkItemModalPage?: number,
  linkItemModalPageSize?: number,
  visible?: boolean,
) => {
  const [value, setValue] = useState("");

  const pagination = useMemo(
    () => ({
      current: linkItemModalPage,
      pageSize: linkItemModalPageSize,
      showSizeChanger: true,
      total: linkItemModalTotalCount,
    }),
    [linkItemModalPage, linkItemModalTotalCount, linkItemModalPageSize],
  );

  const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  useEffect(() => {
    if (!visible) {
      setValue("");
    }
  }, [visible]);

  return {
    handleInput,
    pagination,
    value,
  };
};
