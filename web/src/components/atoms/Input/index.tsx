import { Input as AntInput, InputProps } from "antd";
import { useMemo } from "react";
import { runes } from "runes2";

export type { SearchProps } from "antd/lib/input";

type Props = {
  value?: string;
} & InputProps;

const Input: React.FC<Props> = ({ value, maxLength, ...props }, ref) => {
  const status = useMemo(() => {
    if (maxLength && value && runes(value).length > maxLength) {
      return "error";
    }
  }, [maxLength, value]);

  return (
    <AntInput
      count={{
        max: maxLength,
        strategy: txt => runes(txt).length,
      }}
      value={value}
      ref={ref}
      status={status}
      {...props}
    />
  );
};

export default Input;
export type { InputProps };
