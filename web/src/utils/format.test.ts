import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { test, expect } from "vitest";

import { dateTimeFormat, bytesFormat, transformDayjsToString } from "./format";

dayjs.extend(utc);

test("dateTimeFormat function returns formatted date in local timezone", () => {
  const date = new Date("2022-01-01T12:00:00");
  expect(dateTimeFormat(date)).toBe("2022-01-01 12:00");
});

test("dateTimeFormat function returns formatted date in UTC timezone", () => {
  const date = new Date("2022-01-01T12:00:00");
  expect(dateTimeFormat(date, "YYYY-MM-DD HH:mm", false)).toBe("2022-01-01 12:00");
});

test("bytesFormat function returns formatted string for bytes", () => {
  expect(bytesFormat(1024)).toBe("1 KB");
  expect(bytesFormat(1048576)).toBe("1 MB");
  expect(bytesFormat(0)).toBe("0 Bytes");
});

test("transformMomentToString function returns formatted string for moment objects", () => {
  const momentObject = dayjs("2022-01-01T12:00:00");
  expect(transformDayjsToString(momentObject)).toContain("2022-01-01T12:00:00");
});

test("transformMomentToString function returns formatted string for array of moment objects", () => {
  const date1 = "2022-01-01T12:00:00";
  const date2 = "2022-01-02T12:00:00";
  const result = transformDayjsToString([dayjs(date1), dayjs(date2)]);
  expect(transformDayjsToString(result[0])).toContain(date1);
  expect(transformDayjsToString(result[1])).toContain(date2);
});

test("transformMomentToString function returns original value for non-moment objects", () => {
  const value = "2022-01-01T12:00:00";
  expect(transformDayjsToString(value)).toBe(value);
});
