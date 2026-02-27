import { renderHook } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import useProjectSettings from "./hook";

function renderSettings(
  overrides: {
    onProjectAliasCheck?: (alias: string) => Promise<boolean>;
    originalAlias?: string;
  } = {},
) {
  const onProjectAliasCheck = overrides.onProjectAliasCheck ?? vi.fn().mockResolvedValue(true);
  return renderHook(() => useProjectSettings(onProjectAliasCheck, overrides.originalAlias));
}

describe("ProjectSettings hook", () => {
  describe("aliasValidate", () => {
    test("rejects empty value", async () => {
      const { result } = renderSettings();
      await expect(result.current.aliasValidate("")).rejects.toBeDefined();
    });

    test("resolves when value matches originalAlias", async () => {
      const { result } = renderSettings({ originalAlias: "my-alias" });
      await expect(result.current.aliasValidate("my-alias")).resolves.toBeUndefined();
    });

    test("rejects alias that is too short", async () => {
      const { result } = renderSettings();
      await expect(result.current.aliasValidate("ab")).rejects.toBeDefined();
    });

    test("rejects alias with illegal characters", async () => {
      const { result } = renderSettings();
      await expect(result.current.aliasValidate("INVALID ALIAS!")).rejects.toBeDefined();
    });

    test("resolves for valid unique alias", async () => {
      const onProjectAliasCheck = vi.fn().mockResolvedValue(true);
      const { result } = renderSettings({ onProjectAliasCheck });
      await expect(result.current.aliasValidate("valid-alias")).resolves.toBeUndefined();
      expect(onProjectAliasCheck).toHaveBeenCalledWith("valid-alias");
    });

    test("rejects for duplicate alias", async () => {
      const onProjectAliasCheck = vi.fn().mockResolvedValue(false);
      const { result } = renderSettings({ onProjectAliasCheck });
      await expect(result.current.aliasValidate("taken-alias")).rejects.toBeDefined();
    });

    test("caches previous validation result", async () => {
      const onProjectAliasCheck = vi.fn().mockResolvedValue(true);
      const { result } = renderSettings({ onProjectAliasCheck });
      await result.current.aliasValidate("cached-alias");
      await result.current.aliasValidate("cached-alias");
      expect(onProjectAliasCheck).toHaveBeenCalledTimes(1);
    });

    test("caches failed validation too", async () => {
      const onProjectAliasCheck = vi.fn().mockResolvedValue(false);
      const { result } = renderSettings({ onProjectAliasCheck });
      await expect(result.current.aliasValidate("bad-alias")).rejects.toBeDefined();
      await expect(result.current.aliasValidate("bad-alias")).rejects.toBeDefined();
      expect(onProjectAliasCheck).toHaveBeenCalledTimes(1);
    });
  });
});
