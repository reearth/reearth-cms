import { Select, SelectProps } from "antd";

type DefaultOptionType = NonNullable<SelectProps["options"]>[number];

export type { SelectProps, DefaultOptionType };

export default Select;
