import type { DatePickerProps } from "antd";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(weekday);
dayjs.extend(localeData);

export default DatePicker;
export type { DatePickerProps };
