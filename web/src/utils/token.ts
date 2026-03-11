/* eslint-disable @typescript-eslint/no-extraneous-class */
export abstract class AntdToken {
  // --- Font Size (antd v5 defaults) ---
  public static readonly FONT = {
    /** token.fontSizeSM — 12px */
    SIZE_SM: 12,
    /** token.fontSize — 14px (antd base) */
    SIZE: 14,
    /** token.fontSizeLG — 16px */
    SIZE_LG: 16,
    /** token.fontSizeXL — 20px */
    SIZE_XL: 20,
    /** token.fontSizeHeading3 — 24px */
    SIZE_HEADING_3: 24,
  };

  // --- Border Radius (antd v5 defaults) ---
  public static readonly RADIUS = {
    /** token.borderRadiusXS — 2px */
    XS: 2,
    /** token.borderRadiusSM — 4px */
    SM: 4,
    /** token.borderRadius — 6px */
    BASE: 6,
    /** token.borderRadiusLG — 8px */
    LG: 8,
  };

  // --- Line Height (antd v5 defaults, px values) ---
  public static readonly LINE_HEIGHT = {
    /** 12px font → 20px line-height (token.lineHeightSM context) */
    SM: 20,
    /** 14px font → 22px line-height (token.lineHeight context) */
    BASE: 22,
    /** 16px font → 24px line-height (token.lineHeightLG context) */
    LG: 24,
  };
}
