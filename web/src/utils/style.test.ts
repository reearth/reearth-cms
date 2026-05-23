import { describe, test, expect } from "vitest";

import { AntdColor, AntdToken, CustomColor } from "./style";

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

const COLOR_GROUPS = [
  "RED",
  "VOLCANO",
  "ORANGE",
  "GOLD",
  "YELLOW",
  "LIME",
  "GREEN",
  "CYAN",
  "BLUE",
  "GEEKBLUE",
  "PURPLE",
  "MAGENTA",
  "GREY",
] as const satisfies readonly (keyof typeof AntdColor)[];

describe("Style", () => {
  describe("AntdColor", () => {
    describe.each(COLOR_GROUPS)("%s", groupName => {
      const group = AntdColor[groupName as keyof typeof AntdColor];

      test("has exactly 10 color entries", () => {
        expect(Object.keys(group)).toHaveLength(10);
      });

      test("all values are valid hex colors", () => {
        Object.values(group).forEach(value => {
          expect(value).toMatch(HEX_COLOR_REGEX);
        });
      });

      test("keys follow naming convention", () => {
        for (let i = 0; i <= 9; i++) {
          expect(group).toHaveProperty(`${groupName}_${i}`);
        }
      });
    });

    describe("NEUTRAL", () => {
      const neutral = AntdColor.NEUTRAL;

      test("has all expected background tokens as CSS variables", () => {
        expect(neutral.BG_WHITE).toBe("var(--color-bg-white)");
        expect(neutral.BG_ELEVATED).toBe("var(--color-bg-elevated)");
        expect(neutral.BG_LAYOUT).toBe("var(--color-bg-layout)");
        expect(neutral.BG_LAYOUT_V4).toBe("var(--color-bg-layout-v4)");
      });

      test("has all expected border tokens as CSS variables", () => {
        expect(neutral.BORDER).toBe("var(--color-border)");
        expect(neutral.BORDER_SECONDARY).toBe("var(--color-border-secondary)");
        expect(neutral.BORDER_SPLIT).toBe("var(--color-border-split)");
      });

      test("has all expected text tokens as CSS variables", () => {
        expect(neutral.TEXT).toBe("var(--color-text)");
        expect(neutral.TEXT_TERTIARY).toBe("var(--color-text-tertiary)");
        expect(neutral.TEXT_QUATERNARY).toBe("var(--color-text-quaternary)");
        expect(neutral.TEXT_V5).toBe("var(--color-text-v5)");
      });

      test("has all expected fill tokens as CSS variables", () => {
        expect(neutral.FILL).toBe("var(--color-fill)");
        expect(neutral.FILL_TERTIARY).toBe("var(--color-fill-tertiary)");
        expect(neutral.FILL_QUATERNARY).toBe("var(--color-fill-quaternary)");
      });
    });
  });

  describe("CustomColor", () => {
    test("has theme-sensitive custom colors as CSS variables", () => {
      expect(CustomColor.AVATAR_BG).toBe("var(--custom-avatar-bg)");
      expect(CustomColor.FOCUS_RING_BLUE).toBe("var(--custom-focus-ring-blue)");
      expect(CustomColor.BORDER_SUBTLE).toBe("var(--custom-border-subtle)");
    });

    test("has theme-invariant accent colors as hardcoded values", () => {
      expect(CustomColor.EDITOR_ERROR_GLYPH).toBe("#ecabbb");
    });

    test("has dark header theme colors (theme-invariant)", () => {
      expect(CustomColor.HEADER_BG).toBe("#1d1d1d");
      expect(CustomColor.HEADER_TEXT).toBe("#dbdbdb");
      expect(CustomColor.LOGO_COLOR).toBe("#df3013");
      expect(CustomColor.HEADER_DIVIDER).toBe("#303030");
    });

    test("has theme-sensitive sidebar and misc UI colors as CSS variables", () => {
      expect(CustomColor.SIDEBAR_TEXT).toBe("var(--custom-sidebar-text)");
      expect(CustomColor.BORDER_LIGHT).toBe("var(--custom-border-light)");
      expect(CustomColor.BG_SUBTLE).toBe("var(--custom-bg-subtle)");
      expect(CustomColor.TEXT_MUTED).toBe("var(--custom-text-muted)");
      expect(CustomColor.TEXT_DISABLED).toBe("var(--custom-text-disabled)");
      expect(CustomColor.ICON_MUTED).toBe("var(--custom-icon-muted)");
    });
  });

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

    describe("FONT_WEIGHT", () => {
      test("NORMAL is 400", () => {
        expect(AntdToken.FONT_WEIGHT.NORMAL).toBe(400);
      });
      test("MEDIUM is 500", () => {
        expect(AntdToken.FONT_WEIGHT.MEDIUM).toBe(500);
      });
      test("STRONG matches antd v5 fontWeightStrong (600)", () => {
        expect(AntdToken.FONT_WEIGHT.STRONG).toBe(600);
      });
      test("BOLD is 700", () => {
        expect(AntdToken.FONT_WEIGHT.BOLD).toBe(700);
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

    describe("SHADOW", () => {
      test("BASE matches antd v5 boxShadow", () => {
        expect(AntdToken.SHADOW.BASE).toContain("rgba(0, 0, 0, 0.16)");
        expect(AntdToken.SHADOW.BASE).toContain("rgba(0, 0, 0, 0.12)");
        expect(AntdToken.SHADOW.BASE).toContain("rgba(0, 0, 0, 0.09)");
      });
      test("SECONDARY matches antd v5 boxShadowSecondary", () => {
        expect(AntdToken.SHADOW.SECONDARY).toContain("rgba(0, 0, 0, 0.12)");
        expect(AntdToken.SHADOW.SECONDARY).toContain("rgba(0, 0, 0, 0.08)");
        expect(AntdToken.SHADOW.SECONDARY).toContain("rgba(0, 0, 0, 0.05)");
      });
    });

    describe("SPACING", () => {
      test("XXS matches antd v5 paddingXXS (4px)", () => {
        expect(AntdToken.SPACING.XXS).toBe(4);
      });
      test("XS matches antd v5 paddingXS (8px)", () => {
        expect(AntdToken.SPACING.XS).toBe(8);
      });
      test("SM matches antd v5 paddingSM (12px)", () => {
        expect(AntdToken.SPACING.SM).toBe(12);
      });
      test("BASE matches antd v5 padding (16px)", () => {
        expect(AntdToken.SPACING.BASE).toBe(16);
      });
      test("MD matches antd v5 paddingMD (20px)", () => {
        expect(AntdToken.SPACING.MD).toBe(20);
      });
      test("LG matches antd v5 paddingLG (24px)", () => {
        expect(AntdToken.SPACING.LG).toBe(24);
      });
      test("XL matches antd v5 paddingXL (32px)", () => {
        expect(AntdToken.SPACING.XL).toBe(32);
      });
    });
  });
});
