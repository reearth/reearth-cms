import { describe, expect, test } from "vitest";

import { AntdToken } from "./token";

describe("AntdToken", () => {
  describe("FONT", () => {
    test("SIZE_SM matches antd v5 fontSizeSM (12px)", () => {
      expect(AntdToken.FONT.SIZE_SM).toBe(12);
    });

    test("SIZE matches antd v5 fontSize (14px)", () => {
      expect(AntdToken.FONT.SIZE).toBe(14);
    });

    test("SIZE_LG matches antd v5 fontSizeLG (16px)", () => {
      expect(AntdToken.FONT.SIZE_LG).toBe(16);
    });

    test("SIZE_XL matches antd v5 fontSizeXL (20px)", () => {
      expect(AntdToken.FONT.SIZE_XL).toBe(20);
    });

    test("SIZE_HEADING_3 matches antd v5 fontSizeHeading3 (24px)", () => {
      expect(AntdToken.FONT.SIZE_HEADING_3).toBe(24);
    });
  });

  describe("RADIUS", () => {
    test("XS matches antd v5 borderRadiusXS (2px)", () => {
      expect(AntdToken.RADIUS.XS).toBe(2);
    });

    test("SM matches antd v5 borderRadiusSM (4px)", () => {
      expect(AntdToken.RADIUS.SM).toBe(4);
    });

    test("BASE matches antd v5 borderRadius (6px)", () => {
      expect(AntdToken.RADIUS.BASE).toBe(6);
    });

    test("LG matches antd v5 borderRadiusLG (8px)", () => {
      expect(AntdToken.RADIUS.LG).toBe(8);
    });
  });

  describe("LINE_HEIGHT", () => {
    test("SM matches 12px font line-height (20px)", () => {
      expect(AntdToken.LINE_HEIGHT.SM).toBe(20);
    });

    test("BASE matches 14px font line-height (22px)", () => {
      expect(AntdToken.LINE_HEIGHT.BASE).toBe(22);
    });

    test("LG matches 16px font line-height (24px)", () => {
      expect(AntdToken.LINE_HEIGHT.LG).toBe(24);
    });
  });
});
