import AntTextArea, { TextAreaProps } from "antd/lib/input/TextArea";
import { forwardRef, useMemo } from "react";
import { runes } from "runes2";

type Props = {
  isError?: boolean;
} & TextAreaProps;

const TextArea = forwardRef<HTMLInputElement, Props>(
  ({ value, isError, maxLength, required, ...props }, ref) => {
    const status = useMemo(() => {
      if (
        isError ||
        (required && !value) ||
        (maxLength && typeof value === "string" && value && runes(value).length > maxLength)
      ) {
        return "error";
      }
    }, [required, isError, maxLength, value]);

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
  },
);

export default TextArea;
export type { TextAreaProps };
