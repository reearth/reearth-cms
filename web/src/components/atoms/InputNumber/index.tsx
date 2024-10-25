import { InputNumber as AntDInputNumber, InputNumberProps } from "antd";
import { useMemo } from "react";

const InputNumber: <T extends string | number>(
  props: React.PropsWithChildren<InputNumberProps<T>> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement = ({ value, ...props }) => {
  const status = useMemo(() => {
    if (value) {
      if (props.max && Number(value) > Number(props.max)) {
        return "error";
      } else if (props.min && Number(value) < Number(props.min)) {
        return "error";
      }
    }
  }, [props.max, props.min, value]);

  return <AntDInputNumber value={value} status={status} style={{ width: "100%" }} {...props} />;
};

export default InputNumber;
