import { InputNumber as AntInputNumber, InputNumberProps } from "antd";
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

  return <AntInputNumber value={value} status={status} {...props} />;
};

export default InputNumber;
