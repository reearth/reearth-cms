// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Platform {
  public static readonly IS_MAC =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  /** The modifier key shown in shortcut hints. */
  public static readonly MOD_KEY = Platform.IS_MAC ? "⌘" : "Ctrl";
}
