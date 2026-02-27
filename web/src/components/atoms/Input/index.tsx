import { Input as AntDInput, InputProps, InputRef } from "antd";
import { forwardRef, useMemo } from "react";
import { runes } from "runes2";

export type { SearchProps } from "antd/lib/input";

type Props = {
  isError?: boolean;
} & InputProps;

const Input = forwardRef<InputRef, Props>(
  ({ isError, maxLength, required, value, ...props }, ref) => {
    const status = useMemo(() => {
      if (
        isError ||
        (required && !value) ||
        (maxLength && typeof value === "string" && value && runes(value).length > maxLength)
      ) {
        return "error";
      }
    }, [isError, maxLength, required, value]);

    return (
      <AntDInput
        count={{
          max: maxLength,
          strategy: txt => runes(txt).length,
        }}
        ref={ref}
        status={status}
        value={value}
        {...props}
      />
    );
  },
);

export default Input;
export type { InputProps };
