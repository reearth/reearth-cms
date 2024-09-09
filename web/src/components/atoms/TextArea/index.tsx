import AntTextArea, { TextAreaProps } from "antd/lib/input/TextArea";
import { forwardRef, useMemo } from "react";
import { runes } from "runes2";

type Props = {
  value?: string;
} & TextAreaProps;

const TextArea = forwardRef<HTMLInputElement, Props>(({ value, maxLength, ...props }, ref) => {
  const status = useMemo(() => {
    if (maxLength && value && runes(value).length > maxLength) {
      return "error";
    }
  }, [maxLength, value]);

  return (
    <AntTextArea
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
});

export default TextArea;
export type { TextAreaProps };
