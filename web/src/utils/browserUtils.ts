// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class BrowserUtils {
  public static readonly IS_MAC =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  /** The modifier key shown in shortcut hints. */
  public static readonly MOD_KEY = BrowserUtils.IS_MAC ? "⌘" : "Ctrl";

  public static prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
}
