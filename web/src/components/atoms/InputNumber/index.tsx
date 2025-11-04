import { InputNumber as AntDInputNumber, InputNumberProps } from "antd";
// eslint-disable-next-line import/no-extraneous-dependencies
import { InputNumberRef as RcInputNumberRef } from "rc-input-number";
import { useMemo } from "react";

const InputNumber: <T extends string | number>(
  props: React.PropsWithChildren<InputNumberProps<T>> & React.RefAttributes<RcInputNumberRef>,
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

  return <AntDInputNumber value={value} status={status} style={{ width: "100%" }} {...props} />;
};

export default InputNumber;
