import { InputNumber as AntDInputNumber, InputNumberProps } from "antd";
import { useMemo } from "react";

const InputNumber: <T extends number | string>(
  props: React.PropsWithChildren<InputNumberProps<T>> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement = ({ value, ...props }) => {
  const status = useMemo(() => {
    if (typeof value === "number") {
      if (typeof props.max === "number" && value > props.max) {
        return "error";
      } else if (typeof props.min === "number" && value < props.min) {
        return "error";
      }
    }
  }, [props.max, props.min, value]);

  return <AntDInputNumber status={status} style={{ width: "100%" }} value={value} {...props} />;
};

export default InputNumber;
