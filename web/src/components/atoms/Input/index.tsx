import { Input as AntDInput, InputProps, InputRef } from "antd";
import { forwardRef, useMemo } from "react";
import { runes } from "runes2";

export type { SearchProps } from "antd/lib/input";

type Props = {
  value?: string;
} & InputProps;

const Input = forwardRef<InputRef, Props>(({ value, maxLength, status, ...props }, ref) => {
  const _status = useMemo(() => {
    if (maxLength && value && runes(value).length > maxLength) {
      return "error";
    } else {
      return status;
    }
  }, [maxLength, status, value]);

  return (
    <AntDInput
      count={{
        max: maxLength,
        strategy: txt => runes(txt).length,
      }}
      value={value}
      ref={ref}
      status={_status}
      {...props}
    />
  );
});

export default Input;
export type { InputProps };
